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
  GENERAL = 'general',
  DISCUSSION = 'discussion',
  ANALYSIS = 'analysis',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  REPORTED = 'reported',
}

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
}

export enum TipCategory {
  SINGLE_BET = 'single_bet',
  COMBO_BET = 'combo_bet',
  SYSTEM_BET = 'system_bet',
  LIVE_BET = 'live_bet',
}

export enum TipResult {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  VOID = 'void',
  HALF_WON = 'half_won',
  HALF_LOST = 'half_lost',
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

  @Column({
    type: 'enum',
    enum: TipCategory,
    nullable: true,
  })
  tip_category: TipCategory;

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  match_name: string;

  @Column({ type: 'date', nullable: true })
  match_date: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  match_time: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  outcome: string;

  @Column({ type: 'uuid', nullable: true })
  betting_market_id: string;

  @Column({ type: 'text', nullable: true })
  tip_text: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  odds: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  total_odds: number;

  @Column({ type: 'int', nullable: true })
  stake: number;

  @Column({ type: 'int', nullable: true })
  confidence: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  submission_deadline: Date;

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
  @Column({
    type: 'enum',
    enum: TipResult,
    default: TipResult.PENDING,
    nullable: true,
  })
  tip_result: TipResult;

  @Column({ type: 'boolean', default: false })
  is_result_set: boolean;

  @Column({ type: 'timestamp', nullable: true })
  tip_resolved_at: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tip_profit: number; // Calculated profit/loss

  // Tip validation
  @Column({ type: 'boolean', default: true })
  is_valid_tip: boolean;

  @Column({ type: 'simple-array', nullable: true })
  validation_errors: string[];

  // Additional tip metadata
  @Column({ type: 'text', nullable: true })
  shareable_link: string;

  @Column({ type: 'json', nullable: true })
  edit_history: any[]; // Store edit history as JSON
}
