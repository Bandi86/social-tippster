import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from '../../../backend/src/modules/admin/analytics-dashboard/analytics.service';
import { UserLogin } from '../../../backend/src/modules/admin/analytics-dashboard/entities/user-login.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let userLoginRepo: any;

  beforeEach(async () => {
    userLoginRepo = { find: jest.fn(), count: jest.fn(), delete: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(UserLogin), useValue: userLoginRepo },
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
