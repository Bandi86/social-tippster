import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MonitoringService } from '../../../backend/src/common/services/monitoring.service';
import { AnalyticsService } from '../../../backend/src/modules/admin/analytics-dashboard/analytics.service';
import { DailyStats } from '../../../backend/src/modules/admin/analytics-dashboard/entities/daily-stats.entity';
import { MonthlyStats } from '../../../backend/src/modules/admin/analytics-dashboard/entities/monthly-stats.entity';
import { UserLogin } from '../../../backend/src/modules/admin/analytics-dashboard/entities/user-login.entity';
import { UserSession } from '../../../backend/src/modules/admin/analytics-dashboard/entities/user-session.entity';
import { Comment } from '../../../backend/src/modules/comments/entities/comment.entity';
import { Post } from '../../../backend/src/modules/posts/entities';
import { User } from '../../../backend/src/modules/users/entities/user.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let postRepo: any;
  let userRepo: any;
  let commentRepo: any;
  let dailyStatsRepo: any;
  let monthlyStatsRepo: any;
  let userSessionRepo: any;
  let monitoringService: any;
  let userLoginRepo: any;

  beforeEach(async () => {
    postRepo = { find: jest.fn(), count: jest.fn() };
    userRepo = { find: jest.fn(), count: jest.fn() };
    commentRepo = { find: jest.fn(), count: jest.fn() };
    dailyStatsRepo = { find: jest.fn(), count: jest.fn() };
    monthlyStatsRepo = { find: jest.fn(), count: jest.fn() };
    userSessionRepo = { find: jest.fn(), count: jest.fn() };
    monitoringService = { log: jest.fn() };
    userLoginRepo = { find: jest.fn(), count: jest.fn(), delete: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Post), useValue: postRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Comment), useValue: commentRepo },
        { provide: getRepositoryToken(UserLogin), useValue: userLoginRepo },
        { provide: getRepositoryToken(DailyStats), useValue: dailyStatsRepo },
        { provide: getRepositoryToken(MonthlyStats), useValue: monthlyStatsRepo },
        { provide: getRepositoryToken(UserSession), useValue: userSessionRepo },
        { provide: MonitoringService, useValue: monitoringService },
      ],
    }).compile();
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should fetch user login history', async () => {
    userLoginRepo.find.mockResolvedValue([{ user_id: '1', is_successful: true }]);
    const result = await service.getUserLoginHistory('1');
    expect(result).toHaveLength(1);
  });

  it('should export login history as CSV', async () => {
    userLoginRepo.find.mockResolvedValue([
      {
        login_date: new Date('2025-06-01T12:00:00Z'),
        ip_address: '127.0.0.1',
        user_agent: 'test',
        device_type: 'desktop',
        browser: 'chrome',
        location: 'local',
        is_successful: true,
        failure_reason: '',
        session_start: new Date('2025-06-01T12:00:00Z'),
        session_end: new Date('2025-06-01T13:00:00Z'),
      },
    ]);
    const csv = await service.exportUserLoginHistoryCsv('1');
    expect(csv).toContain('login_date');
    expect(csv).toContain('127.0.0.1');
  });

  it('should detect suspicious activity', async () => {
    userLoginRepo.count.mockResolvedValue(6);
    const suspicious = await service.detectSuspiciousActivity('1');
    expect(suspicious).toBe(true);
  });
});
