import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultsController } from './vaults.controller';
import { VaultsService } from './vaults.service';
import { Vault } from '../database/entities/vault.entity';
import { Deposit } from '../database/entities/deposit.entity';
import { DepositEvent } from '../database/entities/deposit-event.entity';
import { Withdrawal } from '../database/entities/withdrawal.entity';
import { DepositEventService } from './deposit-event.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vault, Deposit, DepositEvent, Withdrawal]),
    AuthModule,
    NotificationsModule,
    RealtimeModule,
    CommonModule,
  ],
  controllers: [VaultsController],
  providers: [VaultsService, DepositEventService],
  exports: [VaultsService, DepositEventService],
})
export class VaultsModule {}
