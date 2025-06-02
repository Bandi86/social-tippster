import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtValidationService {
  constructor(private readonly usersService: UsersService) {}

  async validateAccessToken(payload: JwtPayload): Promise<User> {
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type for access');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active || user.is_banned) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async validateRefreshToken(payload: JwtPayload): Promise<User> {
    if (!payload.type || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type for refresh');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active || user.is_banned) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  validatePayloadStructure(payload: unknown): payload is JwtPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      'email' in payload &&
      typeof (payload as Record<string, unknown>).sub === 'string' &&
      typeof (payload as Record<string, unknown>).email === 'string'
    );
  }
}
