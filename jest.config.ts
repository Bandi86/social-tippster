import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/tests/**/*.spec.@(ts|tsx|js|jsx)',
    '<rootDir>/tests/**/*.test.@(ts|tsx|js|jsx)',
    '!<rootDir>/tests/playwright/**', // ⛔️ Kizárjuk a Playwright teszteket
  ],
  preset: 'ts-jest',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/tests/playwright/', // ⛔️ Kizárjuk a Playwright teszteket
  ],

  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1',
  },
  collectCoverageFrom: [
    'backend/src/modules/**/*.(ts|js)',
    '!backend/src/modules/**/*.interface.ts',
    '!backend/src/modules/**/*.dto.ts',
    '!backend/src/modules/**/*.entity.ts',
  ],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Teszt Riport',
        outputPath: './test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: './reports',
        outputName: 'junit.xml',
      },
    ],
  ],
  setupFiles: ['<rootDir>/tests/setup-env.ts'], // csak env betöltés
  setupFilesAfterEnv: ['<rootDir>/tests/backend/auth-test-setup.ts'], // test utils

  verbose: true,
  maxWorkers: 2,
  testTimeout: 60000,
};

export default config;
