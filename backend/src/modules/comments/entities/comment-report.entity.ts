import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

@Entity('comment_reports')
export class CommentReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_id' })
  reporterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'comment_id' })
  commentId: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ name: 'reviewer_id', nullable: true })
  reviewerId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;
}
