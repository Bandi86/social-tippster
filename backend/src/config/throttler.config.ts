import { ThrottlerModule } from '@nestjs/throttler';

export const ThrottlerConfig = ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 10, // increased burst limit for UI/API
  },
  {
    name: 'medium',
    ttl: 10000, // 10 seconds
    limit: 50, // increased for smoother UI
  },
  {
    name: 'long',
    ttl: 60000, // 1 minute
    limit: 300, // allow more requests per minute
  },
  {
    name: 'auth',
    ttl: 60000, // 1 minute
    limit: 10, // allow more login attempts per minute
  },
]);
