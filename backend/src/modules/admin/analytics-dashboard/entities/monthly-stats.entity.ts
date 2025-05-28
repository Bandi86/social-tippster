import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('monthly_stats')
@Index(['year', 'month'])
export class MonthlyStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  // User metrics
  @Column({ type: 'int', default: 0 })
  new_users: number;

  @Column({ type: 'int', default: 0 })
  active_users: number;

  @Column({ type: 'int', default: 0 })
  total_users: number;

  @Column({ type: 'int', default: 0 })
  verified_users: number;

  @Column({ type: 'int', default: 0 })
  banned_users: number;

  // Post metrics
  @Column({ type: 'int', default: 0 })
  new_posts: number;

  @Column({ type: 'int', default: 0 })
  total_posts: number;

  @Column({ type: 'int', default: 0 })
  published_posts: number;

  @Column({ type: 'int', default: 0 })
  draft_posts: number;

  // Engagement metrics
  @Column({ type: 'bigint', default: 0 })
  total_views: number;

  @Column({ type: 'bigint', default: 0 })
  total_likes: number;

  @Column({ type: 'bigint', default: 0 })
  total_comments: number;

  @Column({ type: 'bigint', default: 0 })
  total_shares: number;

  // Content quality metrics
  @Column({ type: 'int', default: 0 })
  reported_posts: number;

  @Column({ type: 'int', default: 0 })
  flagged_comments: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
