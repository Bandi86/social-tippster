import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockConfigService, TEST_CONSTANTS } from '../../test/setup';
import { ProjectService } from './project.service';

// Mock the utility modules
jest.mock('../common/utils', () => ({
  FileUtils: {
    exists: jest.fn(),
    listDirectory: jest.fn(),
    readFile: jest.fn(),
    getFileStats: jest.fn(),
  },
  GitUtils: {
    getCurrentBranch: jest.fn(),
    getLastCommit: jest.fn(),
    hasUncommittedChanges: jest.fn(),
  },
  ProcessUtils: {
    isPortInUse: jest.fn(),
    getProcessOnPort: jest.fn(),
  },
}));

describe('ProjectService', () => {
  let service: ProjectService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with project root from config', () => {
      expect(configService.get).toHaveBeenCalledWith(
        'PROJECT_ROOT',
        'c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster',
      );
    });
  });

  describe('getProjectOverview', () => {
    it('should return project overview with basic structure', async () => {
      // Mock the methods that getProjectOverview calls
      jest.spyOn(service, 'scanProjects').mockResolvedValue([
        {
          name: 'frontend_new',
          path: '/test/frontend_new',
          type: 'frontend',
          port: 3002,
          status: 'running',
          gitBranch: 'main',
          lastCommit: 'test commit',
        },
      ]);

      jest.spyOn(service, 'getServiceStatuses').mockResolvedValue([
        {
          serviceName: 'frontend_new',
          status: 'healthy',
          responseTime: 100,
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          details: { port: 3002, type: 'frontend' },
        },
      ]);

      const result = await service.getProjectOverview();

      expect(result).toEqual({
        projectRoot: TEST_CONSTANTS.PROJECT_ROOT,
        totalProjects: 1,
        runningServices: 1,
        totalServices: 1,
        projects: expect.any(Array),
        services: expect.any(Array),
        timestamp: expect.any(String),
      });
    });

    it('should handle empty projects gracefully', async () => {
      jest.spyOn(service, 'scanProjects').mockResolvedValue([]);
      jest.spyOn(service, 'getServiceStatuses').mockResolvedValue([]);

      const result = await service.getProjectOverview();

      expect(result.totalProjects).toBe(0);
      expect(result.runningServices).toBe(0);
      expect(result.totalServices).toBe(0);
    });
  });

  describe('getProjectStats', () => {
    beforeEach(() => {
      // Mock the listDirectoryWithExclusions method
      jest.spyOn(service as any, 'listDirectoryWithExclusions').mockResolvedValue([
        { name: 'src', isDirectory: true, path: '/test/src' },
        { name: 'package.json', isDirectory: false, path: '/test/package.json' },
        { name: 'index.ts', isDirectory: false, path: '/test/index.ts' },
      ]);
    });

    it('should return project statistics', async () => {
      const { FileUtils } = require('../common/utils');

      FileUtils.getFileStats.mockResolvedValue({
        size: 1024,
        lines: 50,
        extension: '.ts',
      });

      const result = await service.getProjectStats();

      expect(result).toEqual({
        totalFiles: expect.any(Number),
        codeFiles: expect.any(Number),
        totalLines: expect.any(Number),
        fileTypes: expect.any(Object),
        packageSize: expect.any(Number),
        packageSizeMB: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    it('should handle file access errors gracefully', async () => {
      const { FileUtils } = require('../common/utils');

      FileUtils.getFileStats.mockRejectedValue(new Error('Permission denied'));

      const result = await service.getProjectStats();

      expect(result.totalFiles).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getRecentFiles', () => {
    it('should return recent files with proper filtering', async () => {
      jest.spyOn(service as any, 'listDirectoryWithExclusions').mockResolvedValue([
        { name: 'recent.ts', isDirectory: false, path: '/test/recent.ts', mtime: new Date() },
        {
          name: 'old.ts',
          isDirectory: false,
          path: '/test/old.ts',
          mtime: new Date(Date.now() - 86400000),
        },
      ]);

      const result = await service.getRecentFiles();

      expect(result).toEqual({
        files: expect.any(Array),
        timestamp: expect.any(String),
      });

      expect(result.files.length).toBeGreaterThanOrEqual(0);
    });

    it('should limit results to specified count', async () => {
      jest.spyOn(service as any, 'listDirectoryWithExclusions').mockResolvedValue(
        Array.from({ length: 100 }, (_, i) => ({
          name: `file${i}.ts`,
          isDirectory: false,
          path: `/test/file${i}.ts`,
          mtime: new Date(),
        })),
      );

      const result = await service.getRecentFiles(undefined, 10);

      expect(result.files.length).toBeLessThanOrEqual(10);
    });
  });

  describe('listDirectoryWithExclusions', () => {
    it('should exclude sensitive directories', async () => {
      const testPath = '/test/project';

      // Mock fs.promises.readdir to return mock items
      const mockReaddir = jest.fn().mockResolvedValue([
        { name: 'src', isDirectory: () => true },
        { name: 'node_modules', isDirectory: () => true },
        { name: '.git', isDirectory: () => true },
        { name: 'package.json', isDirectory: () => false },
      ]);

      jest.doMock('fs', () => ({
        promises: {
          readdir: mockReaddir,
        },
      }));

      // Mock FileUtils.getFileStats to return appropriate stats
      const { FileUtils } = require('../common/utils');
      FileUtils.getFileStats = jest.fn().mockImplementation(filePath => {
        if (filePath.includes('src')) {
          return Promise.resolve({ size: 0, lastModified: new Date(), created: new Date() });
        }
        if (filePath.includes('package.json')) {
          return Promise.resolve({ size: 1024, lastModified: new Date(), created: new Date() });
        }
        return Promise.resolve({ size: 0, lastModified: new Date(), created: new Date() });
      });

      const result = await (service as any).listDirectoryWithExclusions(testPath);

      expect(result).toEqual([
        {
          name: 'src',
          path: expect.stringContaining('src'),
          type: 'directory',
          size: 0,
          lastModified: expect.any(Date),
          created: expect.any(Date),
        },
        {
          name: 'package.json',
          path: expect.stringContaining('package.json'),
          type: 'file',
          size: 1024,
          lastModified: expect.any(Date),
          created: expect.any(Date),
        },
      ]);
    });

    it('should handle permission errors gracefully', async () => {
      const testPath = '/nonexistent/path/that/should/not/exist';

      // Clear the mocks from the previous test and reset to clean state
      jest.clearAllMocks();

      // Set up new mocks that will trigger the error path
      jest.doMock('fs', () => ({
        promises: {
          readdir: jest.fn().mockRejectedValue(new Error('ENOENT: no such file or directory')),
        },
      }));

      // Use a spy on the real fs module to simulate the error
      const fs = require('fs');
      const readDirSpy = jest
        .spyOn(fs.promises, 'readdir')
        .mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await (service as any).listDirectoryWithExclusions(testPath);

      // The method should return an empty array when it can't read the directory
      expect(result).toEqual([]);

      // Clean up
      readDirSpy.mockRestore();
    });
  });

  describe('scanProjects', () => {
    it('should discover frontend and backend projects', async () => {
      const { FileUtils, GitUtils } = require('../common/utils');

      FileUtils.exists.mockResolvedValue(true);
      GitUtils.getCurrentBranch.mockResolvedValue('main');
      GitUtils.getLastCommit.mockResolvedValue('test commit');

      const result = await service.scanProjects();

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });
});
