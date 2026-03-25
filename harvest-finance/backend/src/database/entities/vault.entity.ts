import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VaultDeposit } from './vault-deposit.entity';

@Entity('vaults')
export class Vault {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalDeposits: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  liquidity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => VaultDeposit, deposit => deposit.vault)
  deposits: VaultDeposit[];
}
