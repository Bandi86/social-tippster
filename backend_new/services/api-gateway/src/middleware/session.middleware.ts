import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { SessionService, UserContextData } from '../session/session.service';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: UserContextData;
      sessionId?: string;
      userId?: string;
    }
  }
}

/**
 * Session Middleware for API Gateway
 *
 * Validates sessions directly with Redis for performance
 * Fetches fresh user data from auth service when needed
 * Adds user context to requests for downstream services
 */
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly proxyService: ProxyService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(
      `Middleware processing: ${req.method} ${req.originalUrl} | path: ${req.path}`,
    );

    // Skip session validation for public routes
    if (this.isPublicRoute(req.path) || this.isPublicRoute(req.originalUrl)) {
      this.logger.debug(`Public route allowed: ${req.path} | ${req.originalUrl}`);
      return next();
    }

    this.logger.debug(`Protected route: ${req.path}`);

    try {
      // Extract session ID from various sources
      const sessionId = this.extractSessionId(req);

      if (!sessionId) {
        throw new UnauthorizedException('Session not found');
      }

      // Validate session with Redis (fast operation)
      const sessionData = await this.sessionService.validateSession(sessionId);

      if (!sessionData) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Get fresh user data from auth service
      const userData = await this.fetchUserData(sessionData.userId);

      if (!userData) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Add user context to request
      req.user = userData;
      req.sessionId = sessionId;
      req.userId = sessionData.userId;

      // Add user context headers for downstream services
      req.headers['x-user-id'] = sessionData.userId;
      req.headers['x-user-role'] = userData.role;
      req.headers['x-session-id'] = sessionId;

      this.logger.debug(`Session validated for user ${userData.username} (${sessionData.userId})`);
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        res.status(401).json({
          statusCode: 401,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        this.logger.error('Session middleware error:', error);
        res.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Extract session ID from request (cookie, header, or query)
   */
  private extractSessionId(req: Request): string | null {
    // Try refresh token cookie first (HttpOnly)
    if (req.cookies?.refresh_token) {
      return req.cookies.refresh_token;
    }

    // Try Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try session cookie
    if (req.cookies?.session_id) {
      return req.cookies.session_id;
    }

    // Try session header
    if (req.headers['x-session-id']) {
      return req.headers['x-session-id'] as string;
    }

    return null;
  }

  /**
   * Fetch fresh user data from auth service
   */
  private async fetchUserData(userId: string): Promise<UserContextData | null> {
    try {
      const response = await this.proxyService.forwardRequest(
        'auth',
        `/profile/${userId}`,
        'GET',
        undefined,
        { 'x-internal-request': 'true' },
      );

      if (response.status === 200 && response.data) {
        return {
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
          role: response.data.role,
          isActive: response.data.isActive,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to fetch user data for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Check if route is public (doesn't require authentication)
   */
  private isPublicRoute(path: string): boolean {
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/health',
      '/docs',
      '/api-docs',
      '/favicon.ico',
      '/auth/forgot-password',
      '/auth/reset-password',
      // Also include the full API paths for safety
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/health',
      '/api/docs',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
    ];

    return publicRoutes.some(route => path.startsWith(route));
  }
}
