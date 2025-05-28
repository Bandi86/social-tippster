import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Post, PostStatus } from '../../posts/entities';
import { User, UserRole } from '../../users/entities/user.entity';
import { DailyStats } from './entities/daily-stats.entity';
import { MonthlyStats } from './entities/monthly-stats.entity';
import { UserLogin } from './entities/user-login.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(UserLogin)
    private readonly userLoginRepository: Repository<UserLogin>,
    @InjectRepository(DailyStats)
    private readonly dailyStatsRepository: Repository<DailyStats>,
    @InjectRepository(MonthlyStats)
    private readonly monthlyStatsRepository: Repository<MonthlyStats>,
  ) {}

  // POST ANALYTICS
  async getAdminPostStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    reported: number;
    totalViews: number;
    totalLikes: number;
    recentPosts: number;
  }> {
    const [total, published, draft, archived, reported, totalViews, totalLikes, recentPosts] =
      await Promise.all([
        this.postRepository.count(),
        this.postRepository.count({ where: { status: PostStatus.PUBLISHED } }),
        this.postRepository.count({ where: { status: PostStatus.DRAFT } }),
        this.postRepository.count({ where: { status: PostStatus.ARCHIVED } }),
        this.postRepository.count({ where: { is_reported: true } }),
        this.postRepository
          .createQueryBuilder('post')
          .select('COALESCE(SUM(post.views_count), 0)', 'sum')
          .getRawOne()
          .then((res: { sum?: string }) => Number(res?.sum) || 0),
        this.postRepository
          .createQueryBuilder('post')
          .select('COALESCE(SUM(post.likes_count), 0)', 'sum')
          .getRawOne()
          .then((res: { sum?: string }) => Number(res?.sum) || 0),
        this.postRepository
          .createQueryBuilder('post')
          .where('post.created_at >= :weekAgo', {
            weekAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          })
          .getCount(),
      ]);

    return {
      total,
      published,
      draft,
      archived,
      reported,
      totalViews,
      totalLikes,
      recentPosts,
    };
  }

  // USER ANALYTICS
  async getAdminUserStats(): Promise<{
    total: number;
    active: number;
    banned: number;
    unverified: number;
    admins: number;
    recentRegistrations: number;
  }> {
    const [total, active, banned, unverified, admins, recentRegistrations] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { is_active: true } }),
      this.userRepository.count({ where: { is_banned: true } }),
      this.userRepository.count({ where: { is_verified: false } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.created_at >= :startDate', {
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        })
        .getCount(),
    ]);

    return {
      total,
      active,
      banned,
      unverified,
      admins,
      recentRegistrations,
    };
  }

  // COMMENT ANALYTICS - Fixed column names based on actual schema
  async getAdminCommentStats(): Promise<{
    total: number;
    active: number;
    flagged: number;
    reported: number;
    recentComments: number;
  }> {
    const [total, active, flagged, reported, recentComments] = await Promise.all([
      this.commentRepository.count(),
      // Active comments are those without flagReason
      this.commentRepository.count({ where: { flagReason: null } }),
      // Flagged comments have a flagReason
      this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.flagReason IS NOT NULL')
        .getCount(),
      // Count reported comments - assuming there's a reports relation
      this.commentRepository
        .createQueryBuilder('comment')
        .leftJoin('comment_reports', 'reports', 'reports.comment_id = comment.id')
        .where('reports.id IS NOT NULL')
        .getCount(),
      // Recent comments (last 7 days)
      this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.created_at >= :sevenDaysAgo', {
          sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        })
        .getCount(),
    ]);

    return {
      total,
      active,
      flagged,
      reported,
      recentComments,
    };
  }

  // USER GROWTH ANALYTICS
  async getUserGrowthData(): Promise<{ month: string; users: number }[]> {
    const months: { month: string; users: number }[] = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const userCount = await this.userRepository
        .createQueryBuilder('user')
        .where('user.created_at >= :startDate', { startDate: date })
        .andWhere('user.created_at < :endDate', { endDate: nextMonth })
        .getCount();

      months.push({ month: monthName, users: userCount });
    }

    return months;
  }

  // REAL LOGIN ACTIVITY DATA
  async getActivityData(): Promise<{ date: string; logins: number; registrations: number }[]> {
    const days: { date: string; logins: number; registrations: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const [registrations, logins] = await Promise.all([
        this.userRepository
          .createQueryBuilder('user')
          .where('user.created_at >= :dayStart', { dayStart })
          .andWhere('user.created_at <= :dayEnd', { dayEnd })
          .getCount(),
        this.userLoginRepository
          .createQueryBuilder('login')
          .where('login.login_date >= :dayStart', { dayStart })
          .andWhere('login.login_date <= :dayEnd', { dayEnd })
          .getCount(),
      ]);

      days.push({
        date: dayNames[date.getDay()],
        logins,
        registrations,
      });
    }

    return days;
  }

  // TRACK USER LOGIN
  async trackUserLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    deviceType?: string,
    browser?: string,
    location?: string,
  ): Promise<UserLogin> {
    try {
      const login = this.userLoginRepository.create({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
        browser: browser,
        location: location,
        is_successful: true,
      });

      return await this.userLoginRepository.save(login);
    } catch (error) {
      console.error('Failed to track user login:', error);
      throw error;
    }
  }

  // UPDATE DAILY STATS
  async updateDailyStats(date: Date = new Date()): Promise<DailyStats> {
    const dateOnly = new Date(date.toDateString());
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    let dailyStats = await this.dailyStatsRepository.findOne({
      where: { date: dateOnly },
    });

    if (!dailyStats) {
      dailyStats = this.dailyStatsRepository.create({ date: dateOnly });
    }

    // Calculate daily metrics
    const [newUsers, activeUsers, totalLogins, uniqueLogins, newPosts, newComments] =
      await Promise.all([
        this.userRepository
          .createQueryBuilder('user')
          .where('user.created_at >= :start', { start: dateOnly })
          .andWhere('user.created_at < :end', { end: nextDay })
          .getCount(),
        this.userLoginRepository
          .createQueryBuilder('login')
          .select('COUNT(DISTINCT login.user_id)', 'count')
          .where('login.login_date >= :start', { start: dateOnly })
          .andWhere('login.login_date < :end', { end: nextDay })
          .getRawOne()
          .then((res: { count?: string }) => Number(res?.count) || 0),
        this.userLoginRepository
          .createQueryBuilder('login')
          .where('login.login_date >= :start', { start: dateOnly })
          .andWhere('login.login_date < :end', { end: nextDay })
          .getCount(),
        this.userLoginRepository
          .createQueryBuilder('login')
          .select('COUNT(DISTINCT login.user_id)', 'count')
          .where('login.login_date >= :start', { start: dateOnly })
          .andWhere('login.login_date < :end', { end: nextDay })
          .getRawOne()
          .then((res: { count?: string }) => Number(res?.count) || 0),
        this.postRepository
          .createQueryBuilder('post')
          .where('post.created_at >= :start', { start: dateOnly })
          .andWhere('post.created_at < :end', { end: nextDay })
          .getCount(),
        this.commentRepository
          .createQueryBuilder('comment')
          .where('comment.created_at >= :start', { start: dateOnly })
          .andWhere('comment.created_at < :end', { end: nextDay })
          .getCount(),
      ]);

    // Update daily stats
    dailyStats.new_users = newUsers;
    dailyStats.active_users = activeUsers;
    dailyStats.total_logins = totalLogins;
    dailyStats.unique_logins = uniqueLogins;
    dailyStats.new_posts = newPosts;
    dailyStats.new_comments = newComments;

    return await this.dailyStatsRepository.save(dailyStats);
  }

  // COMPREHENSIVE ANALYTICS
  async getComprehensiveAnalytics(): Promise<{
    userStats: any;
    postStats: any;
    commentStats: any;
    userGrowth: any[];
    activityData: any[];
  }> {
    const [userStats, postStats, commentStats, userGrowth, activityData] = await Promise.all([
      this.getAdminUserStats(),
      this.getAdminPostStats(),
      this.getAdminCommentStats(),
      this.getUserGrowthData(),
      this.getActivityData(),
    ]);

    return {
      userStats,
      postStats,
      commentStats,
      userGrowth,
      activityData,
    };
  }
}
