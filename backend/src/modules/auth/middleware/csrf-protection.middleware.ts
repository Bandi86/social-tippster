import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Skip CSRF protection for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // For refresh endpoint, validate Origin and Referer headers
    if (req.path === '/auth/refresh') {
      const origin = req.get('Origin');
      const referer = req.get('Referer');
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'https://your-production-domain.com', // Add your production domain
      ];

      const isValidOrigin = origin && allowedOrigins.includes(origin);
      const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));

      if (!isValidOrigin && !isValidReferer) {
        throw new UnauthorizedException('CSRF protection: Invalid origin or referer');
      }

      // Also check if refresh token cookie exists
      const refreshToken = (req.cookies as Record<string, unknown>)?.refresh_token;
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new UnauthorizedException('CSRF protection: Refresh token cookie missing');
      }
    }

    next();
  }
}
