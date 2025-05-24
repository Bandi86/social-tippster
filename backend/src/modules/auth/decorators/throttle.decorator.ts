import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export const AuthThrottle = () =>
  applyDecorators(
    Throttle({
      default: {
        limit: 5,
        ttl: 60000, // 5 attempts per minute
      },
    }),
  );

export const RefreshThrottle = () =>
  applyDecorators(
    Throttle({
      default: {
        limit: 10,
        ttl: 60000, // 10 refresh attempts per minute
      },
    }),
  );
