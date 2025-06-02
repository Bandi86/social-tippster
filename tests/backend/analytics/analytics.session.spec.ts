import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from '../../../backend/src/modules/admin/analytics-dashboard/analytics.service';
import { UserSession } from '../../../backend/src/modules/admin/analytics-dashboard/entities/user-session.entity';

describe('AnalyticsService - Session Management', () => {
  let service: AnalyticsService;
  let userSessionRepo: any;

  beforeEach(async () => {
    userSessionRepo = { create: jest.fn(), save: jest.fn(), update: jest.fn(), find: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(UserSession), useValue: userSessionRepo },
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
