import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('daily_stats')
@Index(['date'])
export class DailyStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: Date;

  // User metrics
  @Column({ type: 'int', default: 0 })
  new_users: number;

  @Column({ type: 'int', default: 0 })
  active_users: number;

  @Column({ type: 'int', default: 0 })
  total_logins: number;

  @Column({ type: 'int', default: 0 })
  unique_logins: number;

  // Post metrics
  @Column({ type: 'int', default: 0 })
  new_posts: number;

  @Column({ type: 'int', default: 0 })
  total_views: number;

  @Column({ type: 'int', default: 0 })
  total_likes: number;

  @Column({ type: 'int', default: 0 })
  total_shares: number;

  // Comment metrics
  @Column({ type: 'int', default: 0 })
  new_comments: number;

  @Column({ type: 'int', default: 0 })
  comment_votes: number;

  // Report metrics
  @Column({ type: 'int', default: 0 })
  new_reports: number;

  @Column({ type: 'int', default: 0 })
  resolved_reports: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
