import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/posts.entity';
import { User } from '../../users/entities/user.entity';
import { CommentVote } from './comment-vote.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId: string | null;

  @ManyToOne(() => Comment, comment => comment.replies)
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment | null;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  @OneToMany(() => CommentVote, vote => vote.comment)
  votes: CommentVote[];

  @Column({ default: 0 })
  upvotes: number;

  @Column({ default: 0 })
  downvotes: number;

  @Column('jsonb', { nullable: true })
  flagReason: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  flaggedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  flaggedBy: string | null;
}
