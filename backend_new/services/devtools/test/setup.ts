// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3033';
  process.env.PROJECT_ROOT = 'c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster';

  // Mock console methods for clean test output
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(async () => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Global test utilities
export const createMockConfigService = (overrides: Record<string, any> = {}) => {
  const config = {
    PORT: '3033',
    NODE_ENV: 'test',
    PROJECT_ROOT: 'c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster',
    FRONTEND_URL: 'http://localhost:3002',
    LOG_LEVEL: 'error',
    ...overrides,
  };

  return {
    get: jest.fn((key: string, defaultValue?: any) => config[key] ?? defaultValue),
    getOrThrow: jest.fn((key: string) => {
      const value = config[key];
      if (value === undefined) throw new Error(`Configuration key ${key} not found`);
      return value;
    }),
    set: jest.fn(),
    setEnvFilePaths: jest.fn(),
    changes$: {
      subscribe: jest.fn(),
      pipe: jest.fn(),
    } as any,
  } as any;
};

// Mock Docker client
export const createMockDockerClient = () => {
  return {
    listContainers: jest.fn(),
    getContainer: jest.fn(),
    ping: jest.fn(),
  };
};

// Mock file system operations
export const mockFileSystem = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
};

// Test constants
export const TEST_CONSTANTS = {
  PROJECT_ROOT: 'c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster',
  TEST_TIMEOUT: 5000,
  MOCK_PORT: 3033,
};
