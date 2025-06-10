import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { HealthService } from './health.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ProcessUtils
jest.mock('../common/utils', () => ({
  ProcessUtils: {
    checkPortInUse: jest.fn(),
    getCpuUsage: jest.fn(),
    getMemoryUsage: jest.fn(),
    getDiskUsage: jest.fn(),
  },
}));

describe('HealthService', () => {
  let service: HealthService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getServiceHealth', () => {
    it('should return healthy status for responsive service', async () => {
      const { ProcessUtils } = require('../common/utils');
      ProcessUtils.checkPortInUse.mockResolvedValue(true);

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { status: 'ok', version: '1.0.0' },
      });

      const result = await service.getServiceHealth('api-gateway');

      expect(result).toBeDefined();
      expect(result.serviceName).toBe('api-gateway');
      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return null for unknown service', async () => {
      const result = await service.getServiceHealth('unknown-service');
      expect(result).toBeNull();
    });
  });

  describe('checkAllServices', () => {
    it('should check all configured services', async () => {
      const { ProcessUtils } = require('../common/utils');
      ProcessUtils.checkPortInUse.mockResolvedValue(false);

      const result = await service.checkAllServices();

      expect(result).toBeDefined();
      expect(result.services).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(result.summary.total).toBeGreaterThan(0);
      expect(result.overallStatus).toMatch(/^(healthy|degraded|unhealthy)$/);
    });
  });

  describe('getCachedHealth', () => {
    it('should return cached health data', async () => {
      const result = await service.getCachedHealth();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health metrics', async () => {
      const { ProcessUtils } = require('../common/utils');
      ProcessUtils.getCpuUsage = jest.fn().mockResolvedValue(25.5);
      ProcessUtils.getMemoryUsage = jest.fn().mockResolvedValue({
        total: 8 * 1024 * 1024 * 1024, // 8GB
        used: 4 * 1024 * 1024 * 1024, // 4GB
        percentage: 50,
      });
      ProcessUtils.getDiskUsage = jest.fn().mockResolvedValue({
        total: 100 * 1024 * 1024 * 1024, // 100GB
        used: 50 * 1024 * 1024 * 1024, // 50GB
        percentage: 50,
      });

      const result = await service.getSystemHealth();

      expect(result).toBeDefined();
      expect(result.cpu).toBeDefined();
      expect(result.memory).toBeDefined();
      expect(result.disk).toBeDefined();
    });
  });
});
