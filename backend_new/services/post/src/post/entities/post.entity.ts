/* // Post entity - To be implemented with Prisma
// This file has been cleared for Prisma-only implementation
import { ApiProperty } from '@nestjs/swagger';

export enum PostType {
  GENERAL = 'general',
  TIPP = 'tipp',
  ANALYSIS = 'analysis',
  NEWS = 'news',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
}

@Entity('posts')
@Index('idx_user_id', ['userId'])
@Index('idx_created_at', ['createdAt'])
@Index('idx_status_visibility', ['status', 'visibility'])
export class Post {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 123 })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ example: 'My Amazing Tipp' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ example: 'This is the content of my post...' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: 'tipp', enum: PostType })
  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.GENERAL,
  })
  type: PostType;

  @ApiProperty({ example: 'published', enum: PostStatus })
  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @ApiProperty({ example: 'public', enum: PostVisibility })
  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @ApiProperty({ example: ['football', 'premier-league'] })
  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @ApiProperty({ example: ['https://example.com/image1.jpg'] })
  @Column({ type: 'json', nullable: true })
  images?: string[];

  @ApiProperty({ example: 150 })
  @Column({ default: 0 })
  likesCount: number;

  @ApiProperty({ example: 25 })
  @Column({ default: 0 })
  commentsCount: number;

  @ApiProperty({ example: 10 })
  @Column({ default: 0 })
  sharesCount: number;

  @ApiProperty({ example: 185 })
  @Column({ default: 0 })
  viewsCount: number;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isPinned: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isPromoted: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @Column({ nullable: true })
  publishedAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @Column({ nullable: true })
  scheduledAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Additional metadata
  @ApiProperty({ example: 'https://example.com/external-link' })
  @Column({ nullable: true, length: 500 })
  externalLink?: string;

  @ApiProperty({ example: { location: 'London', temperature: '22°C' } })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ example: 'football-match-123' })
  @Column({ nullable: true, length: 100 })
  slug?: string;

  @ApiProperty({ example: 'This is a brief excerpt of the post...' })
  @Column({ nullable: true, length: 500 })
  excerpt?: string;
}
 */
