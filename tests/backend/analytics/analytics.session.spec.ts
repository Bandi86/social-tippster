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

describe('AnalyticsService - Session Management', () => {
  let service: AnalyticsService;
  let postRepo: any;
  let userRepo: any;
  let commentRepo: any;
  let dailyStatsRepo: any;
  let monthlyStatsRepo: any;
  let userLoginRepo: any;
  let monitoringService: any;
  let userSessionRepo: any;

  beforeEach(async () => {
    postRepo = { find: jest.fn(), count: jest.fn() };
    userRepo = { find: jest.fn(), count: jest.fn() };
    commentRepo = { find: jest.fn(), count: jest.fn() };
    dailyStatsRepo = { find: jest.fn(), count: jest.fn() };
    monthlyStatsRepo = { find: jest.fn(), count: jest.fn() };
    userLoginRepo = { find: jest.fn(), count: jest.fn() };
    monitoringService = { log: jest.fn() };
    userSessionRepo = { create: jest.fn(), save: jest.fn(), update: jest.fn(), find: jest.fn() };
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

  it('should create a user session', async () => {
    userSessionRepo.create.mockReturnValue({
      user_id: '1',
      session_token: 'token',
      is_active: true,
    });
    userSessionRepo.save.mockResolvedValue({ id: 'session-id' });
    const result = await service.createUserSession('1', 'token', 'desktop', 'chrome', 'local');
    expect(result).toHaveProperty('id');
  });

  it('should end a user session', async () => {
    userSessionRepo.update.mockResolvedValue({ affected: 1 });
    await expect(service.endUserSession('token')).resolves.not.toThrow();
  });

  it('should get user sessions', async () => {
    userSessionRepo.find.mockResolvedValue([{ id: 'session-id', is_active: true }]);
    const sessions = await service.getUserSessions('1');
    expect(sessions).toHaveLength(1);
  });

  it('should create a user session with metadata', async () => {
    userSessionRepo.create.mockReturnValue({
      user_id: '1',
      session_token: 'token',
      is_active: true,
      refresh_token_id: 'refresh-id',
      os: 'Windows',
      country: 'Hungary',
      city: 'Budapest',
    });
    userSessionRepo.save.mockResolvedValue({ id: 'session-id' });
    const result = await service.createUserSession(
      '1',
      'token',
      'desktop',
      'chrome',
      'local',
      'refresh-id',
      'Windows',
      'Hungary',
      'Budapest',
    );
    expect(result).toHaveProperty('id');
    expect(userSessionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        refresh_token_id: 'refresh-id',
        os: 'Windows',
        country: 'Hungary',
        city: 'Budapest',
      }),
    );
  });
});
