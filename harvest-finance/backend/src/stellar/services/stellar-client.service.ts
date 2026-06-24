import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from 'stellar-sdk';
import { CircuitBreaker, CircuitBreakerOpenError, CircuitBreakerStateChange } from '../utils/circuit-breaker';
import { retry } from '../../common/utils/retry';
import { isRetryableStellarError } from '../utils/stellar-retry';

/**
 * Low-level Stellar Horizon client.
 *
 * This is the ONLY place in the codebase that imports the Stellar SDK and
 * talks to the Horizon API. All other services must inject this class instead
 * of using StellarSdk directly.
 */
@Injectable()
export class StellarClientService {
  private readonly logger = new Logger(StellarClientService.name);
  readonly server: StellarSdk.Horizon.Server;
  readonly networkPassphrase: string;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(private readonly configService: ConfigService) {
    const network = this.configService.get<string>('STELLAR_NETWORK', 'testnet');

    if (network === 'mainnet') {
      this.server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');
      this.networkPassphrase = StellarSdk.Networks.PUBLIC;
    } else {
      this.server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      this.networkPassphrase = StellarSdk.Networks.TESTNET;
    }

    this.circuitBreaker = new CircuitBreaker({
      name: 'stellar-horizon',
      failureThreshold: this.configInt('STELLAR_CIRCUIT_FAILURE_THRESHOLD', 5),
      resetTimeoutMs: this.configInt('STELLAR_CIRCUIT_RESET_TIMEOUT_MS', 30_000),
      shouldTrip: isRetryableStellarError,
      onStateChange: (change: CircuitBreakerStateChange) => this.onCircuitChange(change),
    });
  }

  /** Submit a transaction, retrying on transient errors with exponential backoff. */
  async submitTransaction(
    tx: StellarSdk.Transaction | StellarSdk.FeeBumpTransaction,
    context = 'submitTransaction',
  ): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
    return retry(
      () => this.call(context, () => this.server.submitTransaction(tx)),
      {
        maxAttempts: 3,
        baseDelayMs: 1000,
        maxDelayMs: 2000,
        factor: 2,
        jitter: false,
        isRetryable: isRetryableStellarError,
        onRetry: (err, attempt, delayMs) =>
          this.logger.warn(`Retrying submitTransaction in ${delayMs}ms | attempt=${attempt} err=${(err as Error)?.message}`),
      },
    );
  }

  /** Load a Stellar account by public key. */
  async loadAccount(publicKey: string, context = 'loadAccount'): Promise<StellarSdk.AccountResponse> {
    return this.call(context, () => this.server.loadAccount(publicKey));
  }

  /** Fetch the latest ledger record (limit=1). */
  async fetchLedger(context = 'fetchLedger'): Promise<StellarSdk.Horizon.ServerApi.LedgerRecord> {
    const page = await this.call(context, () => this.server.ledgers().limit(1).order('desc').call());
    return page.records[0];
  }

  /** Fetch fee statistics from Horizon. */
  async feeStats(context = 'feeStats'): Promise<StellarSdk.Horizon.HorizonApi.FeeStatsResponse> {
    return this.call(context, () => this.server.feeStats());
  }

  /** Execute an operation through the circuit breaker. */
  async call<T>(context: string, operation: () => Promise<T>): Promise<T> {
    try {
      return await this.circuitBreaker.execute(operation, context);
    } catch (err) {
      if (err instanceof CircuitBreakerOpenError) {
        throw new ServiceUnavailableException(
          `Stellar Horizon is temporarily unavailable (context: ${context}). Retry after ${err.retryAfterMs}ms`,
        );
      }
      throw err;
    }
  }

  private configInt(key: string, defaultValue: number): number {
    const parsed = Number(this.configService.get<string | number>(key));
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : defaultValue;
  }

  private onCircuitChange(change: CircuitBreakerStateChange): void {
    this.logger.log(
      `Stellar Horizon circuit: ${change.from} -> ${change.to} | reason=${change.reason}`,
    );
  }
}
