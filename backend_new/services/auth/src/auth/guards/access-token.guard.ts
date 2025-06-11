import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Access Token Guard
 *
 * This guard validates JWT access tokens using Passport JWT strategy.
 * It's stateless and only validates the token signature and expiration.
 *
 * Use this guard for protecting API endpoints that require authentication.
 */
@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      // Log the authentication failure for debugging
      console.error('Access token validation failed:', {
        error: err?.message,
        info: info?.message,
        hasToken: !!token,
        path: request.url,
        method: request.method,
      });

      throw new UnauthorizedException('Invalid or expired access token');
    }

    return user;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
