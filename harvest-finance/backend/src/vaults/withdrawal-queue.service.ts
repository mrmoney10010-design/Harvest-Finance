import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Withdrawal, WithdrawalStatus } from '../database/entities/withdrawal.entity';
import { Vault } from '../database/entities/vault.entity';
import { EventBus } from '@nestjs/cqrs';
import { VaultDebitedEvent } from './cqrs/events/vault-debited.event';

@Injectable()
export class WithdrawalQueueService {
  private readonly logger = new Logger(WithdrawalQueueService.name);

  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly dataSource: DataSource,
    private readonly eventBus: EventBus,
  ) {}

  async processQueue(vaultId: string, availableLiquidity: number): Promise<void> {
    const processedWithdrawals: Withdrawal[] = [];

    await this.dataSource.transaction(async (manager) => {
      // Lock queued items to prevent race conditions during concurrent processing
      const queuedWithdrawals = await manager.find(Withdrawal, {
        where: { vaultId, status: WithdrawalStatus.QUEUED },
        order: { queuedAt: 'ASC' },
        lock: { mode: 'pessimistic_write' },
      });

      let currentLiquidity = availableLiquidity;

      for (const withdrawal of queuedWithdrawals) {
        const amount = Number(withdrawal.amount);

        if (amount <= currentLiquidity) {
          // Fulfill the withdrawal
          withdrawal.status = WithdrawalStatus.CONFIRMED;
          withdrawal.confirmedAt = new Date();
          
          await manager.save(withdrawal);
          
          // Deduct from the vault's available pool
          await manager.decrement(Vault, { id: vaultId }, 'totalDeposits', amount);
          
          currentLiquidity -= amount;
          processedWithdrawals.push(withdrawal);
          
          this.logger.log(`Processed queued withdrawal ${withdrawal.id} for vault ${vaultId}`);
        } else {
          // FIFO constraint: break early if we cannot fulfill the oldest remaining item.
          break;
        }
      }
    });

    // Publish events outside the transaction
    for (const withdrawal of processedWithdrawals) {
      this.eventBus.publish(new VaultDebitedEvent(vaultId, withdrawal.userId, Number(withdrawal.amount)));
    }
  }

  async getQueueMetrics(userId: string, vaultId: string): Promise<{ positionInQueue: number; estimatedWaitTime: string }> {
    const userOldestQueued = await this.withdrawalRepository.findOne({
      where: { userId, vaultId, status: WithdrawalStatus.QUEUED },
      order: { queuedAt: 'ASC' },
    });

    if (!userOldestQueued || !userOldestQueued.queuedAt) {
      return { positionInQueue: 0, estimatedWaitTime: 'No active queue' };
    }

    const countBefore = await this.withdrawalRepository.count({
      where: {
        vaultId,
        status: WithdrawalStatus.QUEUED,
        queuedAt: LessThan(userOldestQueued.queuedAt),
      },
    });

    return {
      positionInQueue: countBefore + 1,
      estimatedWaitTime: 'Pending liquidity',
    };
  }
}
