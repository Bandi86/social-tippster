import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './posts.entity';

@Entity('post_views')
@Index(['post_id'])
@Index(['user_id'])
@Index(['created_at'])
@Index(['user_id', 'post_id']) // For unique views per user
export class PostView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true }) // nullable for anonymous views
  user_id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'text', nullable: true })
  referrer: string;

  @Column({ type: 'int', default: 0 })
  duration_seconds: number; // How long the user viewed the post

  @Column({ type: 'boolean', default: false })
  is_unique: boolean; // First view from this user/IP

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
