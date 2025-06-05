export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME || 'tippmix',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // Token rotation configuration
    gracePeriodEnabled: process.env.JWT_GRACE_PERIOD_ENABLED !== 'false', // Default: true
    gracePeriodMs: parseInt(process.env.JWT_GRACE_PERIOD_MS || '30000', 10), // Default: 30 seconds
    // Backward compatibility
    secret: process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    enabled:
      process.env.SENTRY_ENABLED === 'true' ||
      (process.env.NODE_ENV === 'production' &&
        process.env.SENTRY_DSN &&
        process.env.SENTRY_DSN !== 'your-sentry-dsn' &&
        !process.env.SENTRY_DSN.includes('placeholder')),
  },
});
