/**
 * Post Entity - Refactored
 * Frissítve: 2025.06.05
 * Megjegyzés: Minden tipp specifikus mező eltávolítva
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PostStatus, PostType, PostVisibility } from '../enums/post.enums';
import { PostBookmark } from './post-bookmark.entity';
import { PostComment } from './post-comment.entity';
import { PostReport } from './post-report.entity';
import { PostShare } from './post-share.entity';
import { PostView } from './post-view.entity';
import { PostVote } from './post-vote.entity';

@Entity('posts')
@Index(['author_id'])
@Index(['type'])
@Index(['status'])
@Index(['visibility'])
@Index(['created_at'])
@Index(['is_featured'])
@Index(['is_premium'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
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

  // Author relationship
  @Column({ type: 'uuid' })
  author_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string;

  // Category and tags
  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Media
  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  // Interaction settings
  @Column({ type: 'boolean', default: true })
  comments_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  sharing_enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  sharing_platforms: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  sharing_url: string;

  // Status flags
  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'boolean', default: false })
  is_reported: boolean;

  @Column({ type: 'boolean', default: false })
  is_premium: boolean;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  // Counters
  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  comments_count: number;

  @Column({ type: 'int', default: 0 })
  share_count: number;

  @Column({ type: 'int', default: 0 })
  views_count: number;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => PostComment, comment => comment.post)
  comments: PostComment[];

  @OneToMany(() => PostVote, vote => vote.post)
  votes: PostVote[];

  @OneToMany(() => PostReport, report => report.post)
  reports: PostReport[];

  @OneToMany(() => PostBookmark, bookmark => bookmark.post)
  bookmarks: PostBookmark[];

  @OneToMany(() => PostShare, share => share.post)
  shares: PostShare[];

  @OneToMany(() => PostView, view => view.post)
  views: PostView[];
}
