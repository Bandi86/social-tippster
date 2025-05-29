// Seed script for Social Tippster database
// Usage: npx ts-node backend/src/database/seed.ts

import * as dotenv from 'dotenv';
dotenv.config();

import {
  MetricType,
  SystemMetrics,
} from '../modules/admin/analytics-dashboard/entities/system-metrics.entity';
import { UserLogin } from '../modules/admin/analytics-dashboard/entities/user-login.entity';
import { PostBookmark } from '../modules/posts/entities/post-bookmark.entity';
import {
  CommentVoteType,
  PostCommentVote,
} from '../modules/posts/entities/post-comment-vote.entity';
import { CommentStatus, PostComment } from '../modules/posts/entities/post-comment.entity';
import { PostShare, SharePlatform } from '../modules/posts/entities/post-share.entity';
import { PostView } from '../modules/posts/entities/post-view.entity';
import { PostVote, VoteType } from '../modules/posts/entities/post-vote.entity';
import { Post, PostStatus, PostType, PostVisibility } from '../modules/posts/entities/posts.entity';
import { Gender, User, UserRole } from '../modules/users/entities/user.entity';
import dataSource from './data-source';

async function seed() {
  await dataSource.initialize();

  // USERS
  const users = await dataSource.getRepository(User).save([
    {
      username: 'alice',
      email: 'alice@example.com',
      password_hash: 'hashedpassword1',
      first_name: 'Alice',
      last_name: 'Smith',
      gender: Gender.FEMALE,
      role: UserRole.USER,
    },
    {
      username: 'bob',
      email: 'bob@example.com',
      password_hash: 'hashedpassword2',
      first_name: 'Bob',
      last_name: 'Brown',
      gender: Gender.MALE,
      role: UserRole.ADMIN,
    },
    {
      username: 'carol',
      email: 'carol@example.com',
      password_hash: 'hashedpassword3',
      first_name: 'Carol',
      last_name: 'Jones',
      gender: Gender.OTHER,
      role: UserRole.USER,
    },
  ]);

  // POSTS
  const posts = await dataSource.getRepository(Post).save([
    {
      title: 'First Tip',
      content: 'This is a tip post.',
      type: PostType.TIP,
      status: PostStatus.PUBLISHED,
      visibility: PostVisibility.PUBLIC,
      author_id: users[0].user_id,
    },
    {
      title: 'Discussion: Matchday',
      content: 'Let’s discuss the upcoming match.',
      type: PostType.DISCUSSION,
      status: PostStatus.PUBLISHED,
      visibility: PostVisibility.PUBLIC,
      author_id: users[1].user_id,
    },
    {
      title: 'Analysis: Team Form',
      content: 'In-depth analysis of team form.',
      type: PostType.ANALYSIS,
      status: PostStatus.PUBLISHED,
      visibility: PostVisibility.PUBLIC,
      author_id: users[2].user_id,
    },
  ]);

  // POST BOOKMARKS
  await dataSource.getRepository(PostBookmark).save([
    { user_id: users[0].user_id, post_id: posts[1].id },
    { user_id: users[1].user_id, post_id: posts[2].id },
    { user_id: users[2].user_id, post_id: posts[0].id },
  ]);

  // POST VOTES
  await dataSource.getRepository(PostVote).save([
    { user_id: users[0].user_id, post_id: posts[0].id, type: VoteType.LIKE },
    { user_id: users[1].user_id, post_id: posts[0].id, type: VoteType.DISLIKE },
    { user_id: users[2].user_id, post_id: posts[1].id, type: VoteType.LIKE },
  ]);

  // POST SHARES
  await dataSource.getRepository(PostShare).save([
    { user_id: users[0].user_id, post_id: posts[0].id, platform: SharePlatform.FACEBOOK },
    { user_id: users[1].user_id, post_id: posts[1].id, platform: SharePlatform.TWITTER },
    { user_id: users[2].user_id, post_id: posts[2].id, platform: SharePlatform.REDDIT },
  ]);

  // POST VIEWS
  await dataSource.getRepository(PostView).save([
    { user_id: users[0].user_id, post_id: posts[0].id, is_unique: true },
    { user_id: users[1].user_id, post_id: posts[1].id, is_unique: true },
    { user_id: users[2].user_id, post_id: posts[2].id, is_unique: true },
  ]);

  // POST COMMENTS
  const comments = await dataSource.getRepository(PostComment).save([
    {
      post_id: posts[0].id,
      author_id: users[1].user_id,
      content: 'Great tip!',
      status: CommentStatus.PUBLISHED,
    },
    {
      post_id: posts[1].id,
      author_id: users[2].user_id,
      content: 'Looking forward to the match.',
      status: CommentStatus.PUBLISHED,
    },
    {
      post_id: posts[2].id,
      author_id: users[0].user_id,
      content: 'Nice analysis.',
      status: CommentStatus.PUBLISHED,
    },
  ]);

  // POST COMMENT VOTES
  await dataSource.getRepository(PostCommentVote).save([
    { user_id: users[0].user_id, comment_id: comments[0].id, type: CommentVoteType.LIKE },
    { user_id: users[1].user_id, comment_id: comments[1].id, type: CommentVoteType.LIKE },
    { user_id: users[2].user_id, comment_id: comments[2].id, type: CommentVoteType.DISLIKE },
  ]);

  // USER LOGINS
  await dataSource.getRepository(UserLogin).save([
    {
      user_id: users[0].user_id,
      ip_address: '127.0.0.1',
      device_type: 'desktop',
      browser: 'Chrome',
    },
    {
      user_id: users[1].user_id,
      ip_address: '127.0.0.2',
      device_type: 'mobile',
      browser: 'Safari',
    },
    {
      user_id: users[2].user_id,
      ip_address: '127.0.0.3',
      device_type: 'desktop',
      browser: 'Firefox',
    },
  ]);

  // SYSTEM METRICS
  await dataSource.getRepository(SystemMetrics).save([
    {
      metric_type: MetricType.PERFORMANCE,
      metric_name: 'seed_script',
      metric_value: 1,
      unit: 'run',
    },
    {
      metric_type: MetricType.USAGE,
      metric_name: 'users_seeded',
      metric_value: 3,
      unit: 'users',
    },
  ]);

  console.log('✅ Database seeded successfully!');
  await dataSource.destroy();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
