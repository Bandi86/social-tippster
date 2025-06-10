import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project/project.service';

// Mock the entire utils module
jest.mock('./common/utils', () => ({
  FileUtils: {
    exists: jest.fn().mockResolvedValue(true),
    listDirectory: jest.fn().mockResolvedValue([]),
    readFile: jest.fn().mockResolvedValue(''),
    getFileStats: jest.fn().mockResolvedValue({ size: 1024, lines: 10, extension: '.ts' }),
  },
  GitUtils: {
    getCurrentBranch: jest.fn().mockResolvedValue('main'),
    getLastCommit: jest.fn().mockResolvedValue('test commit'),
    hasUncommittedChanges: jest.fn().mockResolvedValue(false),
  },
  ProcessUtils: {
    isPortInUse: jest.fn().mockResolvedValue(false),
    getProcessOnPort: jest.fn().mockResolvedValue(null),
  },
}));

describe('ProjectService (Simple Tests)', () => {
  let service: ProjectService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                PROJECT_ROOT: 'c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster',
                PORT: '3033',
                NODE_ENV: 'test',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have configService injected', () => {
    expect(configService).toBeDefined();
  });

  it('should call config.get for PROJECT_ROOT', () => {
    expect(configService.get).toHaveBeenCalledWith(
      'PROJECT_ROOT',
      'c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster',
    );
  });

  it('should return project stats structure', async () => {
    // Mock the private method
    jest
      .spyOn(service as any, 'listDirectoryWithExclusions')
      .mockResolvedValue([
        { name: 'package.json', isDirectory: false, path: '/test/package.json' },
      ]);

    const result = await service.getProjectStats();

    expect(result).toHaveProperty('totalFiles');
    expect(result).toHaveProperty('codeFiles');
    expect(result).toHaveProperty('totalLines');
    expect(result).toHaveProperty('fileTypes');
    expect(result).toHaveProperty('packageSize');
    expect(result).toHaveProperty('packageSizeMB');
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.totalFiles).toBe('number');
    expect(typeof result.timestamp).toBe('string');
  });

  it('should return recent files structure', async () => {
    // Mock the private method
    jest
      .spyOn(service as any, 'listDirectoryWithExclusions')
      .mockResolvedValue([
        { name: 'recent.ts', isDirectory: false, path: '/test/recent.ts', mtime: new Date() },
      ]);

    const result = await service.getRecentFiles();

    expect(result).toHaveProperty('files');
    expect(result).toHaveProperty('timestamp');
    expect(Array.isArray(result.files)).toBe(true);
    expect(typeof result.timestamp).toBe('string');
  });
});
