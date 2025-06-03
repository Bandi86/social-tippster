import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SentryService } from '../services/sentry.service';

@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  constructor(private readonly sentryService: SentryService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Skip CSRF protection for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // For refresh endpoint, validate Origin and Referer headers
    if (req.path === '/auth/refresh') {
      const origin = req.get('Origin');
      const referer = req.get('Referer');

      // TEMPORARY DEBUGGING - REMOVE IN PRODUCTION
      console.log('CSRF Debug - Path:', req.path);
      console.log('CSRF Debug - Origin:', origin);
      console.log('CSRF Debug - Referer:', referer);
      console.log('CSRF Debug - User-Agent:', req.get('User-Agent'));
      console.log('CSRF Debug - All Headers:', JSON.stringify(req.headers, null, 2));

      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'https://your-production-domain.com',
      ];

      const isValidOrigin = origin && allowedOrigins.includes(origin);
      const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));

      console.log('CSRF Debug - isValidOrigin:', isValidOrigin);
      console.log('CSRF Debug - isValidReferer:', isValidReferer);
      console.log('CSRF Debug - allowedOrigins:', allowedOrigins);

      if (!isValidOrigin && !isValidReferer) {
        // Log CSRF protection violation to Sentry
        this.sentryService.logSecurityEvent('csrf_violation', {
          endpoint: req.path,
          method: req.method,
          origin: origin || 'missing',
          referer: referer || 'missing',
          userAgent: req.get('User-Agent') || 'unknown',
          ipAddress: req.ip || 'unknown',
          allowedOrigins,
          timestamp: new Date().toISOString(),
        });

        console.log('CSRF Debug - BLOCKING REQUEST');
        throw new UnauthorizedException('CSRF protection: Invalid origin or referer');
      }

      console.log('CSRF Debug - ALLOWING REQUEST');
    }

    next();
  }
}
