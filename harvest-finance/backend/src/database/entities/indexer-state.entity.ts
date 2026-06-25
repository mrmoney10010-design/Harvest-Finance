import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('indexer_state')
@Index('idx_indexer_state_contract', ['contractId'], { unique: true })
export class IndexerState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id', type: 'varchar', length: 128, unique: true })
  contractId: string;

  @Column({ name: 'last_cursor', type: 'varchar', length: 128 })
  lastCursor: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
