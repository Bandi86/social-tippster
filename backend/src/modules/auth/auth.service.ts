import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { LoginDto } from '../users/dto/login.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LogoutAllDevicesDto, LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  type?: 'access' | 'refresh';
}

export interface LoginResponse {
  access_token: string;
  user: UserResponseDto;
}

interface RefreshTokenPayload {
  sub: string;
  type: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private isValidRefreshTokenPayload(payload: any): payload is RefreshTokenPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.sub === 'string' &&
      typeof payload.type === 'string'
    );
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    // Check for failed login attempts (brute force protection)
    const failedAttempts = this.failedAttempts.get(email);
    if (failedAttempts && failedAttempts.count >= 5) {
      const timeDiff = new Date().getTime() - failedAttempts.lastAttempt.getTime();
      if (timeDiff < 15 * 60 * 1000) {
        // 15 minutes lockout
        throw new UnauthorizedException(
          'Túl sok sikertelen bejelentkezési kísérlet. Próbálja újra 15 perc múlva.',
        );
      } else {
        // Reset after lockout period
        this.failedAttempts.delete(email);
      }
    }

    const user = await this.usersService.validateUser(email, password);

    if (!user) {
      // Increment failed attempts
      const current = this.failedAttempts.get(email) || { count: 0, lastAttempt: new Date() };
      this.failedAttempts.set(email, {
        count: current.count + 1,
        lastAttempt: new Date(),
      });
      return null;
    }

    // Reset failed attempts on successful login
    this.failedAttempts.delete(email);

    if (user.is_banned) {
      throw new UnauthorizedException('A fiók tiltva van');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('A fiók inaktív');
    }

    return user;
  }

  async login(loginDto: LoginDto, response?: Response): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Hibás email vagy jelszó');
    }

    // Generate access token (short-lived)
    const accessToken = this.generateAccessToken(user);

    // Generate refresh token (long-lived)
    const refreshTokenValue = this.generateRefreshToken(user);

    // Save refresh token to database
    await this.saveRefreshToken(user.user_id, refreshTokenValue);

    // Set refresh token as HttpOnly cookie if response object is provided
    if (response) {
      response.cookie('refreshToken', refreshTokenValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
    }

    const userResponse = await this.usersService.findOne(user.user_id);

    return {
      access_token: accessToken,
      user: userResponse,
    };
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      username: user.username,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.accessSecret'),
      expiresIn: this.configService.get('jwt.accessExpiresIn'),
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.user_id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    // Remove old refresh tokens for this user (optional - for single device login)
    // await this.refreshTokenRepository.delete({ user_id: userId });

    const refreshToken = this.refreshTokenRepository.create({
      user_id: userId,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  async refreshToken(refreshTokenValue: string, response?: Response): Promise<RefreshTokenDto> {
    try {
      // Verify refresh token
      const rawPayload = this.jwtService.verify(refreshTokenValue, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      // Type guard for payload
      if (!this.isValidRefreshTokenPayload(rawPayload)) {
        throw new UnauthorizedException('Érvénytelen token formátum');
      }

      if (rawPayload.type !== 'refresh') {
        throw new UnauthorizedException('Érvénytelen token típus');
      }

      // Check if refresh token exists in database and not revoked
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenValue, is_revoked: false },
        relations: ['user'],
      });

      if (!storedToken) {
        throw new UnauthorizedException('Érvénytelen refresh token');
      }

      // Check if token expired
      if (storedToken.expires_at < new Date()) {
        await this.refreshTokenRepository.update(storedToken.id, { is_revoked: true });
        throw new UnauthorizedException('A refresh token lejárt');
      }

      const user = storedToken.user;

      // Check user status
      if (user.is_banned) {
        throw new UnauthorizedException('A fiók tiltva van');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('A fiók inaktív');
      }

      // Update token usage
      await this.refreshTokenRepository.update(storedToken.id, { used_at: new Date() });

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      // Optionally generate new refresh token and update cookie
      const newRefreshToken = this.generateRefreshToken(user);
      await this.saveRefreshToken(user.user_id, newRefreshToken);

      if (response) {
        response.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });
      }

      // Revoke old refresh token
      await this.refreshTokenRepository.update(storedToken.id, { is_revoked: true });

      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException('Érvénytelen refresh token');
    }
  }

  async logout(userId: string, response?: Response): Promise<LogoutDto> {
    // Revoke all refresh tokens for this user
    await this.refreshTokenRepository.update(
      { user_id: userId, is_revoked: false },
      { is_revoked: true },
    );

    // Clear refresh token cookie
    if (response) {
      response.clearCookie('refreshToken', { path: '/' });
    }

    return {
      message: 'Sikeres kijelentkezés',
    };
  }

  async logoutAllDevices(userId: string): Promise<LogoutAllDevicesDto> {
    // Count active tokens
    const activeTokensCount = await this.refreshTokenRepository.count({
      where: { user_id: userId, is_revoked: false },
    });

    // Revoke all refresh tokens for this user
    await this.refreshTokenRepository.update(
      { user_id: userId, is_revoked: false },
      { is_revoked: true },
    );

    return {
      message: 'Sikeres kijelentkezés minden eszközről',
      devices_logged_out: activeTokensCount,
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Felhasználó nem található');
    }

    if (user.is_banned) {
      throw new UnauthorizedException('A fiók tiltva van');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('A fiók inaktív');
    }

    return user;
  }

  async register(registerDto: RegisterDto): Promise<{ message: string; user: UserResponseDto }> {
    const user = await this.usersService.create(registerDto);

    return {
      message: 'Sikeres regisztráció',
      user: user,
    };
  }
}
