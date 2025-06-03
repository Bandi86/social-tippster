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

export enum NotificationType {
  COMMENT = 'comment',
  VOTE = 'vote',
  MENTION = 'mention',
  FOLLOW = 'follow',
  MESSAGE = 'message',
  POST_FEATURED = 'post_featured',
  BADGE_EARNED = 'badge_earned',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  SYSTEM = 'system',
  ADMIN = 'admin',
  POST_LIKED = 'post_liked',
  POST_SHARED = 'post_shared',
  NEW_FOLLOWER = 'new_follower',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
@Index(['user_id', 'read_status'])
@Index(['type'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ type: 'boolean', default: false })
  read_status: boolean;

  @Column({ type: 'uuid', nullable: true })
  related_post_id: string;

  @Column({ type: 'uuid', nullable: true })
  related_comment_id: string;

  @Column({ type: 'uuid', nullable: true })
  related_user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  action_url: string;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.LOW })
  priority: NotificationPriority;

  @Column({ type: 'timestamp', nullable: true })
  snoozed_until: Date | null;
}
