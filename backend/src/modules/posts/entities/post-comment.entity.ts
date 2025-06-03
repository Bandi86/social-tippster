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
import { Post } from './posts.entity';

export enum CommentStatus {
  PUBLISHED = 'published',
  DELETED = 'deleted',
  MODERATED = 'moderated',
}

@Entity('post_comments')
@Index(['post_id'])
@Index(['author_id'])
@Index(['parent_comment_id'])
@Index(['created_at'])
@Index(['status'])
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @Column({ type: 'uuid' })
  author_id: string;

  @Column({ type: 'uuid', nullable: true })
  parent_comment_id: string; // For nested replies

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PUBLISHED,
  })
  status: CommentStatus;

  // Statistics (denormalized for performance)
  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  dislikes_count: number;

  @Column({ type: 'int', default: 0 })
  replies_count: number;

  // Moderation
  @Column({ type: 'boolean', default: false })
  is_reported: boolean;

  @Column({ type: 'int', default: 0 })
  reports_count: number;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Soft delete
  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relationships
  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => PostComment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment: PostComment;

  @OneToMany(() => PostComment, comment => comment.parent_comment)
  replies: PostComment[];
}
