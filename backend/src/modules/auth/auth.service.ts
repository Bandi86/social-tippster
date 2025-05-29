import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../admin/analytics-dashboard/analytics.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LogoutAllDevicesDto, LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenPayload } from './strategies/refresh-token.strategy';

export interface JwtPayload {
  sub: string;
  type: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  access_token: string;
  user: UserResponseDto;
}

export interface LoginResponseDto {
  access_token: string;
  user: UserResponseDto;
}

// Enhanced request interface for better type safety
/* interface AuthRequest extends Request {
  headers: {
    'user-agent'?: string;
    'x-forwarded-for'?: string;
    'x-real-ip'?: string;
    'x-timezone'?: string;
    timezone?: string;
    [key: string]: string | string[] | undefined;
  };
} */

@Injectable()
export class AuthService {
  private readonly failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Validate refresh token for refresh token strategy
   */
  async validateRefreshToken(
    refreshTokenValue: string,
    payload: RefreshTokenPayload,
  ): Promise<User> {
    // Get all non-revoked tokens for this user
    const storedTokens = await this.refreshTokenRepository.find({
      where: { user_id: payload.sub, is_revoked: false },
      relations: ['user'],
    });

    if (!storedTokens.length) {
      throw new UnauthorizedException('Érvénytelen refresh token');
    }

    // Check if any of the stored hashed tokens match
    let validToken: RefreshToken | null = null;
    for (const token of storedTokens) {
      const isValid = await bcrypt.compare(refreshTokenValue, token.token_hash);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Érvénytelen refresh token');
    }

    // Check if token expired
    if (validToken.expires_at < new Date()) {
      await this.refreshTokenRepository.update(validToken.id, { is_revoked: true });
      throw new UnauthorizedException('A refresh token lejárt');
    }

    const user = validToken.user;

    // Check user status
    if (user.is_banned) {
      throw new UnauthorizedException('A fiók tiltva van');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('A fiók inaktív');
    }

    return user;
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

  async login(
    loginDto: LoginDto,
    request?: Request,
    response?: Response,
  ): Promise<LoginResponseDto> {
    // Validate credentials
    const authenticatedUser = await this.validateUser(loginDto.email, loginDto.password);

    if (!authenticatedUser) {
      throw new UnauthorizedException('Hibás email vagy jelszó');
    }

    // Update last_login, timezone, and language_preference
    const updateData: Partial<UpdateUserDto> = {
      // last_login: new Date().toISOString(), // Removed because it's not in UpdateUserDto
    };

    // Set timezone if provided, otherwise detect from request or use default
    if (loginDto.timezone) {
      updateData.timezone = loginDto.timezone;
    } else {
      // Try to detect timezone from request headers or use default
      updateData.timezone = this.extractTimezone(request) || 'Europe/Budapest';
    }

    // Set language preference, default to Hungarian
    updateData.language_preference = loginDto.language_preference || 'hu';

    // Update user in database using the update method
    await this.usersService.update(authenticatedUser.user_id, updateData);

    // Generate access token (short-lived)
    const accessToken = this.generateAccessToken(authenticatedUser);

    // Generate refresh token (long-lived)
    const refreshTokenValue = this.generateRefreshToken(authenticatedUser);

    // Save refresh token to database
    await this.saveRefreshToken(authenticatedUser.user_id, refreshTokenValue);

    // Set refresh token as HttpOnly cookie if response object is provided
    if (response) {
      const isProduction = process.env.NODE_ENV === 'production';

      response.cookie('refresh_token', refreshTokenValue, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/', // Make cookie available for all paths
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        domain: isProduction ? undefined : 'localhost', // Allow cross-port access in development
      });
    }

    // Get updated user data
    const userResponse = await this.usersService.findOne(authenticatedUser.user_id);

    // Track login after successful authentication
    if (authenticatedUser && request) {
      try {
        // Extract IP address safely
        const ip: string | undefined = this.extractIpAddress(request);

        // Safely access user-agent header
        const userAgent: string | undefined = this.extractUserAgent(request);
        await this.analyticsService.trackUserLogin(
          authenticatedUser.user_id,
          ip,
          userAgent,
          this.getDeviceType(userAgent),
          this.getBrowser(userAgent),
        );
      } catch (error) {
        // Don't fail login if analytics tracking fails
        console.error('Failed to track user login:', error);
      }
    }

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
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });
  }

  private generateRefreshToken(user: User): string {
    const payload: Partial<JwtPayload> = {
      sub: user.user_id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    // Hash the refresh token before storing
    const saltRounds = 12;
    const hashedToken = await bcrypt.hash(token, saltRounds);

    // Remove old refresh tokens for this user (optional - for single device login)
    // await this.refreshTokenRepository.delete({ user_id: userId });

    const refreshToken = this.refreshTokenRepository.create({
      user_id: userId,
      token_hash: hashedToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  async refreshToken(refreshTokenValue: string, response?: Response): Promise<RefreshTokenDto> {
    try {
      // Verify refresh token
      const rawPayload: unknown = this.jwtService.verify(refreshTokenValue, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Type guard for payload
      if (!this.isValidRefreshTokenPayload(rawPayload)) {
        throw new UnauthorizedException('Érvénytelen token formátum');
      }

      if (rawPayload.type !== 'refresh') {
        throw new UnauthorizedException('Érvénytelen token típus');
      }

      // Check if refresh token exists in database and not revoked
      const storedTokens = await this.refreshTokenRepository.find({
        where: { user_id: rawPayload.sub, is_revoked: false },
        relations: ['user'],
      });

      if (!storedTokens.length) {
        throw new UnauthorizedException('Érvénytelen refresh token');
      }

      // Check if any of the stored hashed tokens match
      let validToken: RefreshToken | null = null;
      for (const token of storedTokens) {
        const isValid = await bcrypt.compare(refreshTokenValue, token.token_hash);
        if (isValid) {
          validToken = token;
          break;
        }
      }

      if (!validToken) {
        throw new UnauthorizedException('Érvénytelen refresh token');
      }

      // Check if token expired
      if (validToken.expires_at < new Date()) {
        await this.refreshTokenRepository.update(validToken.id, { is_revoked: true });
        throw new UnauthorizedException('A refresh token lejárt');
      }

      const user = validToken.user;

      // Check user status
      if (user.is_banned) {
        throw new UnauthorizedException('A fiók tiltva van');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('A fiók inaktív');
      }

      // Update token usage
      await this.refreshTokenRepository.update(validToken.id, { used_at: new Date() });

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      // Optionally generate new refresh token and update cookie (token rotation)
      const newRefreshToken = this.generateRefreshToken(user);
      await this.saveRefreshToken(user.user_id, newRefreshToken);

      if (response) {
        const isProduction = process.env.NODE_ENV === 'production';

        response.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'strict' : 'lax',
          path: '/', // Make cookie available for all paths
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          domain: isProduction ? undefined : 'localhost', // Allow cross-port access in development
        });
      }

      // Revoke old refresh token
      await this.refreshTokenRepository.update(validToken.id, { is_revoked: true });

      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException('Érvénytelen refresh token');
    }
  }

  private isValidRefreshTokenPayload(payload: unknown): payload is RefreshTokenPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      'type' in payload &&
      typeof (payload as Record<string, unknown>).sub === 'string' &&
      typeof (payload as Record<string, unknown>).type === 'string'
    );
  }

  async logout(userId: string, response?: Response): Promise<LogoutDto> {
    // Revoke all refresh tokens for this user
    await this.refreshTokenRepository.update(
      { user_id: userId, is_revoked: false },
      { is_revoked: true },
    );

    // Clear refresh token cookie
    if (response) {
      const isProduction = process.env.NODE_ENV === 'production';
      response.clearCookie('refresh_token', {
        path: '/',
        domain: isProduction ? undefined : 'localhost',
      });
      response.clearCookie('refreshToken', { path: '/' }); // Clear old cookie name for compatibility
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
    if (!payload.email) {
      throw new UnauthorizedException('Érvénytelen token: hiányzó email');
    }

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

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: UserResponseDto; accessToken: string }> {
    // Set default language_preference to 'hu' if not provided
    if (!registerDto.language_preference) {
      registerDto.language_preference = 'hu';
    }

    // Set default timezone if not provided
    if (!registerDto.timezone) {
      registerDto.timezone = 'Europe/Budapest';
    }

    const user = await this.usersService.create(registerDto);

    // Generate access token for the new user
    const payload: JwtPayload = {
      sub: user.user_id,
      type: 'access',
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    return {
      message: 'Sikeres regisztráció',
      user: user,
      accessToken: accessToken,
    };
  }

  private getDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private getBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'other';
  }

  /**
   * Extract timezone from request headers or client data
   */
  private extractTimezone(request?: Request): string | undefined {
    if (!request) {
      return undefined;
    }

    // Check if timezone is in request headers
    const headers = request.headers as Record<string, string | string[] | undefined>;
    const timezoneHeader = headers['x-timezone'] || headers['timezone'];
    if (typeof timezoneHeader === 'string') {
      return timezoneHeader;
    }

    // Check if timezone is in request body
    if (request.body && typeof request.body === 'object') {
      const body = request.body as Record<string, unknown>;
      if ('timezone' in body && typeof body.timezone === 'string') {
        return body.timezone;
      }
    }

    return undefined;
  }

  /**
   * Safely extract IP address from request object
   */
  private extractIpAddress(request?: Request): string | undefined {
    if (!request) {
      return undefined;
    }

    // Try to get IP from request.ip first
    if (request.ip) {
      return request.ip;
    }

    // Check connection.remoteAddress
    if (request.connection && 'remoteAddress' in request.connection) {
      const connection = request.connection as { remoteAddress?: string };
      if (connection.remoteAddress) {
        return connection.remoteAddress;
      }
    }

    // Check socket.remoteAddress
    if (request.socket && 'remoteAddress' in request.socket) {
      const socket = request.socket as { remoteAddress?: string };
      if (socket.remoteAddress) {
        return socket.remoteAddress;
      }
    }

    // Check for forwarded headers
    const headers = request.headers as Record<string, string | string[] | undefined>;
    const forwardedFor = headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      // Take the first IP if there are multiple
      const firstIp = forwardedFor.split(',')[0]?.trim();
      return firstIp;
    }

    const realIp = headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp;
    }

    return undefined;
  }

  /**
   * Safely extract user agent from request object
   */
  private extractUserAgent(request?: Request): string | undefined {
    if (!request) {
      return undefined;
    }

    const userAgent = request.headers['user-agent'];
    return typeof userAgent === 'string' ? userAgent : undefined;
  }
}
