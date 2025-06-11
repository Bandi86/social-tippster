import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // If middleware already validated session and set user context, allow access
    if (request.user && request.userId) {
      return true;
    }

    // If no user context, session validation failed
    throw new UnauthorizedException('Authentication required');
  }
}
