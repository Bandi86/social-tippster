import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtValidationService } from '../services/jwt-validation.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly jwtValidationService: JwtValidationService,
  ) {
    const secret = configService.get<string>('jwt.refreshSecret');
    if (!secret) {
      throw new Error('JWT refreshSecret is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const cookies = request?.cookies as Record<string, unknown> | undefined;
          const token = typeof cookies?.refreshToken === 'string' ? cookies.refreshToken : null;
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<any> {
    const cookies = req?.cookies as Record<string, unknown> | undefined;
    const refreshTokenValue =
      typeof cookies?.refreshToken === 'string' ? cookies.refreshToken : undefined;

    if (!refreshTokenValue) {
      throw new UnauthorizedException('Refresh token hiányzik');
    }

    // Use unified validation
    await this.jwtValidationService.validateRefreshToken(payload);

    // Then validate the actual token
    await this.authService.validateRefreshToken(refreshTokenValue, {
      sub: payload.sub,
      type: 'refresh',
      iat: payload.iat,
      exp: payload.exp,
    });

    return { userId: payload.sub, email: payload.email };
  }
}
