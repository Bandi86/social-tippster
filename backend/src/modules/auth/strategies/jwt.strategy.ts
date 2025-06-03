import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SecurityMonitoringService } from '../services/security-monitoring.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly securityMonitoringService: SecurityMonitoringService,
  ) {
    const secret = configService.get<string>('jwt.accessSecret');
    if (!secret) {
      throw new Error('JWT accessSecret is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      // Find user by ID (payload.sub) since that's the user identifier in JWT
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        // Log token validation failure
        await this.securityMonitoringService.logTokenValidationFailure(
          `sub:${payload.sub}`,
          'unknown',
          'unknown',
          'User not found',
        );
        throw new UnauthorizedException('Invalid JWT payload: user not found');
      }

      // Additional security check: verify email matches if provided in payload
      if (payload.email && user.email !== payload.email) {
        // Log token validation failure
        await this.securityMonitoringService.logTokenValidationFailure(
          `sub:${payload.sub}`,
          'unknown',
          'unknown',
          'Email mismatch',
        );
        throw new UnauthorizedException('Invalid JWT payload: email mismatch');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log generic token validation failure
      await this.securityMonitoringService.logTokenValidationFailure(
        `sub:${payload.sub}`,
        'unknown',
        'unknown',
        'Invalid JWT payload',
      );
      throw new UnauthorizedException('Invalid JWT payload');
    }
  }
}
