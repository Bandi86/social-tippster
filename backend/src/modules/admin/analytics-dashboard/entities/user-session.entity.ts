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
import { User } from '../../../users/entities/user.entity';

@Entity('user_sessions')
@Index(['user_id'])
@Index(['session_token'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 512, nullable: true })
  session_token: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @CreateDateColumn({ type: 'timestamp' })
  session_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  session_end: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  refresh_token_id: string | null; // Link to refresh token entity

  @Column({ type: 'varchar', length: 100, nullable: true })
  os: string; // Operating system

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string; // Geolocation country

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string; // Geolocation city

  @Column({ type: 'text', nullable: true })
  fingerprint_hash?: string;

  @Column({ type: 'json', nullable: true })
  device_fingerprint?: any;

  @Column({ type: 'timestamp', nullable: true })
  last_activity?: Date;

  @Column({ type: 'int', default: 0 })
  activity_count?: number;

  @Column({ type: 'timestamp', nullable: true })
  extended_at?: Date;

  @Column({ type: 'int', default: 0 })
  extension_count?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  expiry_reason?: string;
}
