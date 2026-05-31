import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultsController } from './vaults.controller';
import { VaultsService } from './vaults.service';
import { CommandHandlers } from './cqrs/commands/handlers';
import { QueryHandlers } from './cqrs/queries/handlers';
import { EventHandlers } from './cqrs/events/handlers';
import { VaultReadRepository } from './read/vault-read.repository';
import { Vault } from '../database/entities/vault.entity';
import { Deposit } from '../database/entities/deposit.entity';
import { Withdrawal } from '../database/entities/withdrawal.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vault, Deposit, Withdrawal]),
    CqrsModule,
    AuthModule,
    NotificationsModule,
    RealtimeModule,
    CommonModule,
  ],
  controllers: [VaultsController],
  providers: [
    VaultsService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    VaultReadRepository,
  ],
  exports: [VaultsService],
})
export class VaultsModule {}
