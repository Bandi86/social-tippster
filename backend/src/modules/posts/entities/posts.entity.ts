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

export enum PostType {
  TIP = 'tip',
  DISCUSSION = 'discussion',
  NEWS = 'news',
  ANALYSIS = 'analysis',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
}

@Entity('posts')
@Index(['author_id'])
@Index(['type'])
@Index(['status'])
@Index(['created_at'])
@Index(['match_id'])
@Index(['is_featured'])
@Index(['is_premium'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.DISCUSSION,
  })
  type: PostType;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Author relationship
  @Column({ type: 'uuid' })
  author_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  // Tip-specific fields
  @Column({ type: 'uuid', nullable: true })
  match_id: string;

  @Column({ type: 'uuid', nullable: true })
  betting_market_id: string;

  @Column({ type: 'text', nullable: true })
  tip_text: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  odds: number;

  @Column({ type: 'int', nullable: true })
  stake: number;

  @Column({ type: 'int', nullable: true })
  confidence: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  // Scheduling
  @Column({ type: 'timestamp', nullable: true })
  scheduled_for: Date;

  // Interaction settings
  @Column({ type: 'boolean', default: true })
  comments_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  voting_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  sharing_enabled: boolean;

  // Premium features
  @Column({ type: 'boolean', default: false })
  is_premium: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  // Media
  @Column({ type: 'simple-array', nullable: true })
  image_urls: string[];

  // External links
  @Column({ type: 'text', nullable: true })
  external_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  external_title: string;

  @Column({ type: 'text', nullable: true })
  external_description: string;

  @Column({ type: 'text', nullable: true })
  external_image_url: string;

  // Statistics (denormalized for performance)
  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  dislikes_count: number;

  @Column({ type: 'int', default: 0 })
  comments_count: number;

  @Column({ type: 'int', default: 0 })
  shares_count: number;

  @Column({ type: 'int', default: 0 })
  views_count: number;

  @Column({ type: 'int', default: 0 })
  bookmarks_count: number;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Soft delete
  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // SEO fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'simple-array', nullable: true })
  meta_keywords: string[];

  // Moderation
  @Column({ type: 'boolean', default: false })
  is_reported: boolean;

  @Column({ type: 'int', default: 0 })
  reports_count: number;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean; // For verified tips

  // Performance tracking
  @Column({ type: 'timestamp', nullable: true })
  last_interaction_at: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  engagement_rate: number;

  // Tip result tracking (for completed tips)
  @Column({ type: 'boolean', nullable: true })
  tip_result: boolean; // true = won, false = lost, null = pending

  @Column({ type: 'timestamp', nullable: true })
  tip_resolved_at: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tip_profit: number; // Calculated profit/loss
}
