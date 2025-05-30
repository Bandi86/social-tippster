// Seed script for Social Tippster database
// Usage: npx ts-node backend/src/database/seed.ts

import * as dotenv from 'dotenv';
import { DeepPartial, Repository } from 'typeorm';
dotenv.config();

/* console.log(
  'DATABASE_PASSWORD:',
  process.env.DATABASE_PASSWORD,
  typeof process.env.DATABASE_PASSWORD,
); */

import {
  MetricType,
  SystemMetrics,
} from '../modules/admin/analytics-dashboard/entities/system-metrics.entity';
import { CommentStatus, PostComment } from '../modules/posts/entities/post-comment.entity';
import { PostVote, VoteType } from '../modules/posts/entities/post-vote.entity';
import { Post, PostStatus, PostType, PostVisibility } from '../modules/posts/entities/posts.entity';
import { BadgeTier, Gender, User, UserRole } from '../modules/users/entities/user.entity';
import dataSource from './data-source';

async function seed() {
  try {
    await dataSource.initialize();
    console.log('🔌 Database connected');

    // Törlés natív SQL-lel, CASCADE-dal!
    await dataSource.query(`
      TRUNCATE TABLE
        post_comment_votes,
        post_comments,
        post_bookmarks,
        post_shares,
        post_views,
        post_votes,
        posts,
        user_logins,
        system_metrics,
        users
      RESTART IDENTITY CASCADE;
    `);
    console.log('🧹 Cleared existing data (CASCADE)');

    // USERS (csak a létező mezőkkel!)
    const users = await dataSource.getRepository(User).save([
      {
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hashedpassword1',
        first_name: 'Alice',
        last_name: 'Smith',
        phone_number: '+3612345678',
        date_of_birth: new Date('1990-05-12'),
        gender: Gender.FEMALE,
        bio: 'Football fan and tipster.',
        location: 'Budapest, Hungary',
        website: 'https://alice-tips.com',
        is_active: true,
        is_verified: true,
        is_banned: false,
        verified_at: new Date('2023-01-02T09:00:00Z'),
        last_login: new Date('2024-05-29T18:00:00Z'),
        login_count: 142,
        is_premium: true,
        premium_expiration: new Date('2025-06-01T00:00:00Z'),
        referral_code: 'ALICE2024',
        referral_count: 8,
        follower_count: 350,
        following_count: 120,
        post_count: 47,
        reputation_score: 2850,
        badge_count: 6,
        highest_badge_tier: BadgeTier.PLATINUM,
        role: UserRole.USER,
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password_hash: 'hashedpassword2',
        first_name: 'Bob',
        last_name: 'Brown',
        phone_number: '+36701234567',
        date_of_birth: new Date('1985-11-23'),
        gender: Gender.MALE,
        bio: 'Professional sports analyst.',
        location: 'Debrecen, Hungary',
        website: 'https://bobsportsdata.com',
        is_active: true,
        is_verified: true,
        is_banned: false,
        verified_at: new Date('2022-06-20T14:30:00Z'),
        last_login: new Date('2024-05-30T08:15:00Z'),
        login_count: 95,
        is_premium: true,
        premium_expiration: new Date('2024-12-31T23:59:59Z'),
        referral_code: 'BOBPRO2024',
        referral_count: 15,
        follower_count: 580,
        following_count: 200,
        post_count: 73,
        reputation_score: 4200,
        badge_count: 8,
        highest_badge_tier: BadgeTier.DIAMOND,
        role: UserRole.ADMIN,
      },
      {
        username: 'carol',
        email: 'carol@example.com',
        password_hash: 'hashedpassword3',
        first_name: 'Carolina',
        last_name: 'Jones',
        phone_number: '+36301239876',
        date_of_birth: new Date('1992-02-15'),
        gender: Gender.FEMALE,
        bio: 'Data analyst by profession.',
        location: 'Szeged, Hungary',
        website: 'https://carolstats.blog',
        is_active: true,
        is_verified: true,
        is_banned: false,
        verified_at: new Date('2023-03-11T10:00:00Z'),
        last_login: new Date('2024-05-29T21:45:00Z'),
        login_count: 67,
        is_premium: false,
        referral_code: 'CAROLDATA',
        referral_count: 4,
        follower_count: 190,
        following_count: 85,
        post_count: 29,
        reputation_score: 1650,
        badge_count: 3,
        highest_badge_tier: BadgeTier.GOLD,
        role: UserRole.MODERATOR,
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // POSTS
    const posts = await dataSource.getRepository(Post).save([
      {
        title: 'Premier League Predictions',
        content: 'Chelsea vs Arsenal looks like a draw to me.',
        type: PostType.TIP,
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        author_id: users[0].user_id,
      },
      {
        title: 'Champions League Discussion',
        content: 'Real Madrid vs Manchester City should be epic!',
        type: PostType.DISCUSSION,
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        author_id: users[1].user_id,
      },
    ]);
    console.log(`✅ Created ${posts.length} posts`);

    // COMMENTS
    const commentRepo: Repository<PostComment> = dataSource.getRepository(PostComment);
    const comments: PostComment[] = [];
    for (const post of posts) {
      for (let i = 0; i < users.length; i++) {
        const commentData: DeepPartial<PostComment> = {
          post_id: post.id,
          author_id: users[i].user_id,
          content: `Comment ${i + 1} on ${post.title}`,
          status: CommentStatus.PUBLISHED,
        };
        const comment = await commentRepo.save(commentData);
        comments.push(comment);
      }
    }
    console.log('✅ Created comments');

    // POST VOTES
    for (const post of posts) {
      for (const user of users) {
        await dataSource.getRepository(PostVote).save({
          user_id: user.user_id,
          post_id: post.id,
          type: VoteType.LIKE,
        });
      }
    }
    console.log(`✅ Created post votes`);

    // SYSTEM METRICS
    await dataSource.getRepository(SystemMetrics).save({
      metric_type: MetricType.USAGE,
      metric_name: 'active_users',
      metric_value: users.length,
      unit: 'users',
    });
    console.log(`✅ Created system metrics`);

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
