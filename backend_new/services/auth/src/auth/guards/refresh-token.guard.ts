import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../session/session.service';
import { verifyRefreshToken } from '../utils/jwt.util';

/**
 * Refresh Token Guard
 *
 * This guard validates refresh tokens from HttpOnly cookies and checks:
 * - JWT signature and expiration
 * - Session validity in database
 * - Optional IP address and User Agent consistency
 *
 * Use this guard for the /auth/refresh endpoint only.
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = this.extractRefreshTokenFromCookies(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }

    // Verify JWT signature and expiration
    const payload = verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check session validity in database
    const session = await this.sessionService.findValidSession(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Session not found or expired');
    }

    // Optional: Validate session fingerprint (IP, User Agent)
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];

    const validSession = await this.sessionService.validateSessionWithFingerprint(
      refreshToken,
      clientIp,
      userAgent,
    );

    if (!validSession) {
      throw new UnauthorizedException('Session validation failed');
    }

    // Attach user and session info to request for use in controller
    request['user'] = {
      id: payload.userId,
      sessionId: session.userId, // session only contains userId now
    };
    request['session'] = session;
    request['refreshToken'] = refreshToken;

    return true;
  }

  private extractRefreshTokenFromCookies(request: Request): string | undefined {
    return request.cookies?.refreshToken;
  }

  private getClientIp(request: Request): string | undefined {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      request.ip
    );
  }
}
