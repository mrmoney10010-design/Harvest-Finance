import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CustomLoggerService } from '../../logger/custom-logger.service';

export interface PlatformCircuitBreakerState {
  active: boolean;
}

@Injectable()
export class PlatformCircuitBreakerService {
  private readonly REDIS_KEY = 'platform:circuit-breaker:active';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: CustomLoggerService,
  ) {}

  async isActive(): Promise<boolean> {
    try {
      const value = await this.cacheManager.get<boolean>(this.REDIS_KEY);
      return value === true;
    } catch (error) {
      this.logger.error(
        'Failed to read circuit breaker state from Redis',
        error instanceof Error ? error.stack : String(error),
        'PlatformCircuitBreakerService',
      );
      return false;
    }
  }

  async getState(): Promise<PlatformCircuitBreakerState> {
    const active = await this.isActive();
    return { active };
  }

  async activate(
    adminId: string,
    reason?: string,
  ): Promise<PlatformCircuitBreakerState> {
    try {
      await this.cacheManager.set(this.REDIS_KEY, true);
      this.logger.errorEvent('platform_circuit_breaker_activated', {
        adminId,
        reason: reason || 'Manual activation',
        timestamp: new Date().toISOString(),
      });
      return { active: true };
    } catch (error) {
      this.logger.error(
        'Failed to activate circuit breaker in Redis',
        error instanceof Error ? error.stack : String(error),
        'PlatformCircuitBreakerService',
      );
      throw new InternalServerErrorException(
        'Failed to activate circuit breaker',
      );
    }
  }

  async deactivate(
    adminId: string,
    reason?: string,
  ): Promise<PlatformCircuitBreakerState> {
    try {
      await this.cacheManager.set(this.REDIS_KEY, false);
      this.logger.errorEvent('platform_circuit_breaker_deactivated', {
        adminId,
        reason: reason || 'Manual deactivation',
        timestamp: new Date().toISOString(),
      });
      return { active: false };
    } catch (error) {
      this.logger.error(
        'Failed to deactivate circuit breaker in Redis',
        error instanceof Error ? error.stack : String(error),
        'PlatformCircuitBreakerService',
      );
      throw new InternalServerErrorException(
        'Failed to deactivate circuit breaker',
      );
    }
  }
}
