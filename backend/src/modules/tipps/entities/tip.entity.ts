import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TipCategory, TipResult } from '../enums/tip.enums';

@Entity('tipps')
@Index(['post_id'])
@Index(['match_date'])
@Index(['tip_result'])
@Index(['created_at'])
export class Tip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @Column({ type: 'uuid', nullable: true })
  match_id?: string;

  @Column({ type: 'varchar', length: 255 })
  match_name: string;

  @Column({ type: 'date' })
  match_date: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  match_time?: string;

  @Column({ type: 'varchar', length: 255 })
  outcome: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  odds: number;

  @Column({ type: 'int' })
  stake: number;

  @Column({ type: 'int', nullable: true })
  confidence?: number;

  @Column({ type: 'varchar', length: 50 })
  tip_category: TipCategory;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  tip_result: TipResult;

  @Column({ type: 'timestamp', nullable: true })
  submission_deadline?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'uuid' })
  author_id: string;

  @Column({ type: 'boolean', default: false })
  is_result_set: boolean;

  @Column({ type: 'timestamp', nullable: true })
  tip_resolved_at?: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  tip_profit?: number;

  @Column({ type: 'boolean', default: true })
  is_valid_tip: boolean;

  @Column({ type: 'simple-array', nullable: true })
  validation_errors?: string[];
}
