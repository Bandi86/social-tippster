import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PostComment } from './post-comment.entity';

export enum CommentVoteType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity('post_comment_votes')
@Unique(['user_id', 'comment_id'])
@Index(['comment_id'])
@Index(['user_id'])
export class PostCommentVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  comment_id: string;

  @Column({
    type: 'enum',
    enum: CommentVoteType,
  })
  type: CommentVoteType;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PostComment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: PostComment;
}
