import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly proxyService: ProxyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // Validate token with auth service
      const response = await this.proxyService.forwardRequest(
        'auth',
        '/validate-token',
        'POST',
        { token },
      );

      if (response.status === 200 && response.data.valid) {
        request.user = response.data.user;
        return true;
      }

      throw new UnauthorizedException('Invalid token');
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
