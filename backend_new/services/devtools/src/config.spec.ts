import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

describe('ConfigService Integration', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('should return project root', () => {
    const projectRoot = configService.get('PROJECT_ROOT');
    expect(projectRoot).toBe('c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster');
  });

  it('should return port', () => {
    const port = configService.get('PORT', '3000');
    expect(port).toBe('3033');
  });

  it('should return default value when key not found', () => {
    const unknown = configService.get('UNKNOWN_KEY', 'default');
    expect(unknown).toBe('default');
  });
});
