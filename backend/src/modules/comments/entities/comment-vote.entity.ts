import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

export enum VoteType {
  DOWNVOTE = -1,
  UPVOTE = 1,
}

@Entity('comment_votes')
@Unique(['userId', 'commentId'])
export class CommentVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'comment_id' })
  commentId: string;

  @ManyToOne(() => Comment, (comment: Comment) => comment.votes as CommentVote[], {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  value: VoteType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
