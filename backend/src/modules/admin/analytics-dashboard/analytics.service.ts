import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { MonitoringService } from '../../../common/services/monitoring.service';
import { Comment } from '../../comments/entities/comment.entity';
import { Post } from '../../posts/entities';
import { PostStatus } from '../../posts/enums/post.enums';
import { User, UserRole } from '../../users/entities/user.entity';
import { DailyStats } from './entities/daily-stats.entity';
import { MonthlyStats } from './entities/monthly-stats.entity';
import { UserLogin } from './entities/user-login.entity';
import { UserSession } from './entities/user-session.entity';

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
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly monitoringService: MonitoringService,
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

  /**
   * Find login record by user and session start time
   */
  async findLoginByUserAndTime(userId: string, sessionStart: Date) {
    return await this.userLoginRepository.findOne({
      where: {
        user_id: userId,
        session_start: sessionStart,
      },
    });
  }

  /**
   * Update login record with session end time
   */
  async updateLoginSessionEnd(loginId: string, sessionEnd: Date) {
    return await this.userLoginRepository.update(loginId, {
      session_end: sessionEnd,
    });
  }

  /**
   * Enhanced trackUserLogin to support new fields - SINGLE VERSION
   */
  async trackUserLogin(loginData: {
    user_id: string | null;
    login_date?: Date;
    ip_address?: string;
    user_agent?: string;
    device_type?: string;
    browser?: string;
    location?: string;
    is_successful: boolean;
    failure_reason?: string;
    session_start?: Date;
    session_end?: Date;
    session_id?: string;
  }): Promise<UserLogin> {
    try {
      const login = this.userLoginRepository.create({
        user_id: loginData.user_id ?? undefined,
        login_date: loginData.login_date || new Date(),
        ip_address: loginData.ip_address,
        user_agent: loginData.user_agent,
        device_type: loginData.device_type,
        browser: loginData.browser,
        location: loginData.location,
        is_successful: loginData.is_successful,
        failure_reason: loginData.failure_reason,
        session_start: loginData.session_start,
        session_end: loginData.session_end,
      });

      const savedLogin = await this.userLoginRepository.save(login);

      // Monitor for suspicious activity if this is a failed login
      if (!loginData.is_successful && loginData.user_id) {
        await this.checkAndLogSuspiciousActivity(
          loginData.user_id,
          loginData.ip_address,
          loginData.user_agent,
          loginData.failure_reason,
        );
      }

      // Log auth event to monitoring service
      this.monitoringService.logAuthEvent({
        userId: loginData.user_id || undefined,
        userEmail: undefined, // Not available in this context
        ipAddress: loginData.ip_address,
        userAgent: loginData.user_agent,
        eventType: 'login',
        success: loginData.is_successful,
        details: {
          loginId: savedLogin.id,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      });

      return savedLogin;
    } catch (error) {
      console.error('Failed to track user login:', error);
      throw error;
    }
  }

  // Check and log suspicious activity method
  private async checkAndLogSuspiciousActivity(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    failureReason?: string,
  ): Promise<void> {
    try {
      const isSuspicious = await this.detectSuspiciousActivity(userId);

      if (isSuspicious) {
        this.monitoringService.logSuspiciousActivity({
          userId,
          ipAddress,
          userAgent,
          activityType: 'multiple_failed_logins',
          details: { failureReason },
          severity: 'medium',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to check suspicious activity:', error);
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
          .then((res: { count?: string | number } | undefined) => {
            if (!res || res.count == null) return 0;
            const count = typeof res.count === 'string' ? parseInt(res.count, 10) : res.count;
            return isNaN(count) ? 0 : count;
          }),
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
          .then((res: { count?: string | number } | undefined) => {
            if (!res || res.count == null) return 0;
            const count = typeof res.count === 'string' ? parseInt(res.count, 10) : res.count;
            return isNaN(count) ? 0 : count;
          }),
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

  async getUserLoginHistory(userId: string) {
    return this.userLoginRepository.find({
      where: { user_id: userId },
      order: { login_date: 'DESC' },
      take: 100,
    });
  }

  async exportUserLoginHistoryCsv(userId: string): Promise<string> {
    const logins = await this.getUserLoginHistory(userId);
    const header = [
      'login_date',
      'ip_address',
      'user_agent',
      'device_type',
      'browser',
      'location',
      'is_successful',
      'failure_reason',
      'session_start',
      'session_end',
    ].join(',');
    const rows = logins.map(l =>
      [
        l.login_date?.toISOString() ?? '',
        l.ip_address ?? '',
        l.user_agent ?? '',
        l.device_type ?? '',
        l.browser ?? '',
        l.location ?? '',
        l.is_successful ? 'success' : 'failure',
        l.failure_reason ?? '',
        l.session_start?.toISOString() ?? '',
        l.session_end?.toISOString() ?? '',
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }

  // Security & Monitoring: Add a method to detect suspicious login activity (e.g., many failed attempts)
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour
    const failedAttempts = await this.userLoginRepository.count({
      where: {
        user_id: userId,
        is_successful: false,
        login_date: MoreThan(since),
      },
    });
    return failedAttempts >= 5;
  }

  // Data Retention: Cleanup old login records (e.g., older than 1 year)
  async cleanupOldLoginRecords(retentionDays = 365) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    await this.userLoginRepository.delete({ login_date: LessThan(cutoff) });
  }

  // SESSION MANAGEMENT
  async createUserSession(
    userId: string,
    sessionToken: string,
    deviceType?: string,
    browser?: string,
    location?: string,
    refreshTokenId?: string | null,
    os?: string,
    country?: string,
    city?: string,
  ): Promise<UserSession> {
    const session = this.userSessionRepository.create({
      user_id: userId,
      session_token: sessionToken,
      device_type: deviceType,
      browser,
      location,
      session_start: new Date(),
      is_active: true,
      refresh_token_id: refreshTokenId ?? null,
      os,
      country,
      city,
    });
    return await this.userSessionRepository.save(session);
  }

  async endUserSession(sessionToken: string): Promise<void> {
    await this.userSessionRepository.update(
      { session_token: sessionToken, is_active: true },
      { session_end: new Date(), is_active: false },
    );
  }

  async getUserSessions(userId: string) {
    return this.userSessionRepository.find({
      where: { user_id: userId },
      order: { session_start: 'DESC' },
      take: 20,
    });
  }

  async getAllUserSessions() {
    return this.userSessionRepository.find({ order: { session_start: 'DESC' } });
  }

  async endUserSessionById(sessionId: string): Promise<void> {
    await this.userSessionRepository.update(sessionId, {
      session_end: new Date(),
      is_active: false,
    });
  }

  async endAllUserSessions(userId: string): Promise<void> {
    await this.userSessionRepository.update(
      { user_id: userId, is_active: true },
      { session_end: new Date(), is_active: false },
    );
  }

  // LIVE LOGIN STATISTICS FOR REAL-TIME MONITORING
  async getLiveLoginStats(): Promise<{
    currentActiveUsers: number;
    todaySuccessfulLogins: number;
    todayFailedLogins: number;
    last24HoursActivity: {
      successfulLogins: number;
      failedLogins: number;
      uniqueUsers: number;
    };
    realTimeStats: {
      last5MinutesLogins: number;
      last5MinutesFailures: number;
      averageSessionDuration: number;
    };
    suspiciousActivity: {
      multipleFailedAttemptsToday: number;
      unusualLocationLogins: number;
      rapidLoginAttempts: number;
    };
    topFailureReasons: Array<{ reason: string; count: number }>;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

    // Get current active users (sessions that are active)
    const currentActiveUsers = await this.userSessionRepository.count({
      where: { is_active: true },
    });

    // Today's login statistics
    const [todaySuccessfulLogins, todayFailedLogins] = await Promise.all([
      this.userLoginRepository.count({
        where: {
          login_date: MoreThan(todayStart),
          is_successful: true,
        },
      }),
      this.userLoginRepository.count({
        where: {
          login_date: MoreThan(todayStart),
          is_successful: false,
        },
      }),
    ]);

    // Last 24 hours activity
    const [last24HSuccessful, last24HFailed, last24HUniqueUsers] = await Promise.all([
      this.userLoginRepository.count({
        where: {
          login_date: MoreThan(last24Hours),
          is_successful: true,
        },
      }),
      this.userLoginRepository.count({
        where: {
          login_date: MoreThan(last24Hours),
          is_successful: false,
        },
      }),
      this.userLoginRepository
        .createQueryBuilder('login')
        .select('COUNT(DISTINCT login.user_id)', 'count')
        .where('login.login_date >= :since', { since: last24Hours })
        .andWhere('login.is_successful = :success', { success: true })
        .getRawOne()
        .then((res: { count?: string }) => Number(res?.count) || 0),
    ]);

    // Last 5 minutes real-time stats
    const [last5MinLogins, last5MinFailures] = await Promise.all([
      this.userLoginRepository.count({
        where: {
          login_date: MoreThan(last5Minutes),
          is_successful: true,
        },
      }),
      this.userLoginRepository.count({
        where: {
          login_date: MoreThan(last5Minutes),
          is_successful: false,
        },
      }),
    ]);

    // Calculate average session duration
    const sessionDurations = (await this.userSessionRepository
      .createQueryBuilder('session')
      .select(
        'AVG(EXTRACT(EPOCH FROM (session.session_end - session.session_start)))',
        'avg_duration',
      )
      .where('session.session_end IS NOT NULL')
      .andWhere('session.session_start >= :since', { since: last24Hours })
      .getRawOne()) as { avg_duration?: string | null };

    const averageSessionDuration = Math.round(
      Number((sessionDurations as { avg_duration?: string })?.avg_duration) || 1800,
    );

    // Suspicious activity detection
    const [multipleFailedAttempts, unusualLocationLogins, rapidLoginAttempts] = await Promise.all([
      // Users with multiple failed attempts today (>=3)
      this.userLoginRepository
        .createQueryBuilder('login')
        .select('COUNT(DISTINCT login.user_id)', 'count')
        .where('login.login_date >= :todayStart', { todayStart })
        .andWhere('login.is_successful = :success', { success: false })
        .groupBy('login.user_id')
        .having('COUNT(*) >= 3')
        .getRawMany()
        .then(results => results.length),

      // Logins from different countries today (estimate)
      this.userLoginRepository
        .createQueryBuilder('login')
        .select('COUNT(DISTINCT login.ip_address)', 'count')
        .where('login.login_date >= :todayStart', { todayStart })
        .andWhere('login.is_successful = :success', { success: true })
        .andWhere('login.location IS NOT NULL')
        .getRawOne()
        .then((res: { count?: string }) => Math.min(Number(res?.count) || 0, 10)), // Cap for demo

      // Users with rapid login attempts (>5 in last hour)
      this.userLoginRepository
        .createQueryBuilder('login')
        .select('COUNT(DISTINCT login.user_id)', 'count')
        .where('login.login_date >= :since', { since: new Date(now.getTime() - 60 * 60 * 1000) })
        .groupBy('login.user_id')
        .having('COUNT(*) > 5')
        .getRawMany()
        .then(results => results.length),
    ]);

    // Top failure reasons
    const topFailureReasons = await this.userLoginRepository
      .createQueryBuilder('login')
      .select('login.failure_reason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .where('login.login_date >= :todayStart', { todayStart })
      .andWhere('login.is_successful = :success', { success: false })
      .andWhere('login.failure_reason IS NOT NULL')
      .groupBy('login.failure_reason')
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany()
      .then((results: any[]) =>
        results.map(r => ({
          reason: (r as { reason?: string }).reason || 'unknown',
          count: Number((r as { count?: string }).count) || 0,
        })),
      );

    return {
      currentActiveUsers,
      todaySuccessfulLogins,
      todayFailedLogins,
      last24HoursActivity: {
        successfulLogins: last24HSuccessful,
        failedLogins: last24HFailed,
        uniqueUsers: last24HUniqueUsers,
      },
      realTimeStats: {
        last5MinutesLogins: last5MinLogins,
        last5MinutesFailures: last5MinFailures,
        averageSessionDuration,
      },
      suspiciousActivity: {
        multipleFailedAttemptsToday: multipleFailedAttempts,
        unusualLocationLogins: unusualLocationLogins,
        rapidLoginAttempts,
      },
      topFailureReasons,
    };
  }
}
