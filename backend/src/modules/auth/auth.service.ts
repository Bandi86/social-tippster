import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../admin/analytics-dashboard/analytics.service';
import { UserSession } from '../admin/analytics-dashboard/entities/user-session.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  DeviceFingerprint,
  DeviceFingerprintingService,
} from './services/device-fingerprinting.service';
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { SentryService } from './services/sentry.service';
import { SessionExpiryPolicy, SessionExpiryService } from './services/session-expiry.service';
import { SessionLifecycleService } from './services/session-lifecycle.service';

export interface LoginResponse {
  access_token: string;
  user: UserResponseDto;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
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
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly analyticsService: AnalyticsService,
    private readonly sessionLifecycleService: SessionLifecycleService,
    private readonly deviceFingerprintingService: DeviceFingerprintingService,
    private readonly sessionExpiryService: SessionExpiryService,
    private readonly securityMonitoringService: SecurityMonitoringService,
    private readonly sentryService: SentryService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    try {
      return await this.usersService.create(registerDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Regisztráció sikertelen');
    }
  }

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
        // Log brute force attempt
        await this.securityMonitoringService.logBruteForceAttempt(
          email,
          'unknown', // IP will be logged in login method
          'unknown', // UserAgent will be logged in login method
          failedAttempts.count,
          true,
        );

        // Log brute force detection to Sentry
        this.sentryService.logSecurityEvent('brute_force_detection', {
          email,
          attemptCount: failedAttempts.count,
          lockoutDuration: '15 minutes',
          timestamp: new Date().toISOString(),
        });

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

      // Log authentication failure to Sentry
      this.sentryService.logFailedAuth(email, 'Invalid credentials');

      return null;
    }

    // Reset failed attempts on successful login
    this.failedAttempts.delete(email);

    if (user.is_banned) {
      // Log banned user login attempt to Sentry
      this.sentryService.logSecurityEvent('banned_user_login_attempt', {
        userId: user.user_id,
        email: user.email,
        banReason: user.ban_reason || 'Unspecified',
        timestamp: new Date().toISOString(),
      });

      throw new UnauthorizedException('A fiók tiltva van');
    }

    if (!user.is_active) {
      // Log inactive user login attempt to Sentry
      this.sentryService.logSecurityEvent('inactive_user_login_attempt', {
        userId: user.user_id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      throw new UnauthorizedException('A fiók inaktív');
    }

    return user;
  }

  /**
   * Enhanced login method with session tracking
   */
  async login(
    loginDto: LoginDto,
    request?: Request,
    response?: Response,
    clientFingerprint?: Partial<DeviceFingerprint>,
  ): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      // Track failed login with enhanced details
      await this.trackFailedLogin(loginDto.email, 'Invalid credentials', request);

      // Log failed login to security monitoring
      const deviceInfo = this.extractDeviceInfo(request);
      await this.securityMonitoringService.logFailedLogin(
        loginDto.email,
        deviceInfo.ip_address || 'unknown',
        request?.get('User-Agent') || 'unknown',
        'Invalid credentials',
        this.failedAttempts.get(loginDto.email)?.count,
      );

      throw new UnauthorizedException('Hibás email vagy jelszó');
    }

    // Generate device fingerprint
    const deviceFingerprint = request
      ? this.deviceFingerprintingService.generateDeviceFingerprint(request, clientFingerprint)
      : this.deviceFingerprintingService.generateFallbackFingerprint(clientFingerprint);

    // Check for suspicious login patterns
    await this.checkSuspiciousLogin(user.user_id, deviceFingerprint);

    // Generate tokens with dynamic expiry
    const policy = this.sessionExpiryService.getSessionExpiryPolicy(
      user.role,
      loginDto.remember_me,
    );

    const { access_token, refresh_token } = this.generateTokensWithPolicy(user, policy);

    // Save refresh token
    const refreshTokenEntity = await this.saveRefreshToken(user.user_id, refresh_token, request);

    // Create session with fingerprint
    await this.sessionLifecycleService.createSessionWithFingerprint(
      user.user_id,
      refreshTokenEntity.id,
      deviceFingerprint,
    );

    // Set refresh token cookie
    if (response) {
      this.setRefreshTokenCookie(response, refresh_token);
    }

    // Get user response DTO
    const userEntity = await this.usersService.getUserById(user.user_id);
    if (!userEntity) {
      throw new UnauthorizedException('Felhasználó nem található');
    }
    const userResponseDto = new UserResponseDto(userEntity);

    // Log successful authentication to Sentry
    const deviceInfo = this.extractDeviceInfo(request);
    this.sentryService.logSuccessfulAuth(
      user.user_id,
      user.email,
      deviceInfo.ip_address || undefined,
    );

    return {
      access_token,
      user: userResponseDto,
    };
  }

  private async checkSuspiciousLogin(
    userId: string,
    currentFingerprint: DeviceFingerprint,
  ): Promise<void> {
    // Get recent session fingerprints
    const recentSessions = await this.userSessionRepository.find({
      where: { user_id: userId },
      order: { session_start: 'DESC' },
      take: 5,
    });

    for (const session of recentSessions) {
      if (session.device_fingerprint) {
        const comparison = this.deviceFingerprintingService.compareFingerprints(
          currentFingerprint,
          session.device_fingerprint as DeviceFingerprint,
        );

        if (comparison.is_suspicious) {
          // Log suspicious activity to security monitoring
          const user = await this.usersService.findById(userId);
          await this.securityMonitoringService.logSuspiciousLogin(
            userId,
            user?.email || 'unknown',
            currentFingerprint.ip_address || 'unknown',
            currentFingerprint.user_agent || 'unknown',
            comparison.suspicious_changes,
            comparison.similarity_score,
          );

          // Log suspicious activity to Sentry
          this.sentryService.logSuspiciousActivity('unusual_location', {
            userId,
            email: user?.email,
            similarityScore: comparison.similarity_score,
            suspiciousChanges: comparison.suspicious_changes,
            ipAddress: currentFingerprint.ip_address,
            userAgent: currentFingerprint.user_agent,
          });

          console.warn(`Suspicious login detected for user ${userId}:`, {
            similarity_score: comparison.similarity_score,
            suspicious_changes: comparison.suspicious_changes,
          });

          // Optional: Send security alert, require additional verification
          // await this.sendSecurityAlert(userId, comparison);
        }
      }
    }
  }

  /**
   * Validate JWT payload for JWT strategy
   */
  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    try {
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.is_active) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }

  /**
   * Generate access and refresh tokens - UNIFIED METHOD
   */
  private generateTokens(user: User): { access_token: string; refresh_token: string } {
    const payload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      type: 'refresh',
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    const refresh_token = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return { access_token, refresh_token };
  }

  /**
   * Generate tokens with dynamic expiry policy
   */
  private generateTokensWithPolicy(
    user: User,
    policy: SessionExpiryPolicy,
  ): { access_token: string; refresh_token: string } {
    const payload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      type: 'refresh',
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn:
        policy.access_token_expiry ||
        this.configService.get<string>('jwt.accessExpiresIn') ||
        '15m',
    });

    const refresh_token = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn:
        policy.refresh_token_expiry ||
        this.configService.get<string>('jwt.refreshExpiresIn') ||
        '7d',
    });

    return { access_token, refresh_token };
  }

  /**
   * Create and track user session
   */
  private async createUserSession(
    userId: string,
    refreshTokenId: string,
    request?: Request,
  ): Promise<UserSession> {
    const sessionToken = this.generateSessionToken();
    const deviceInfo = this.extractDeviceInfo(request);

    const session = this.userSessionRepository.create({
      user_id: userId,
      session_token: sessionToken,
      device_type: deviceInfo.device_type || undefined,
      browser: deviceInfo.browser || undefined,
      os: deviceInfo.os || undefined,
      location: deviceInfo.location || undefined,
      country: deviceInfo.country || undefined,
      city: deviceInfo.city || undefined,
      refresh_token_id: refreshTokenId,
      session_start: new Date(),
      is_active: true,
    });

    return await this.userSessionRepository.save(session);
  }

  /**
   * Track successful login with session details
   */
  private async trackSuccessfulLogin(
    userId: string,
    sessionId: string,
    request?: Request,
  ): Promise<void> {
    const deviceInfo = this.extractDeviceInfo(request);

    await this.analyticsService.trackUserLogin({
      user_id: userId,
      login_date: new Date(),
      ip_address: deviceInfo.ip_address || undefined,
      user_agent: request?.get('User-Agent') || undefined,
      device_type: deviceInfo.device_type || undefined,
      browser: deviceInfo.browser || undefined,
      location: deviceInfo.location || undefined,
      is_successful: true,
      session_start: new Date(),
      session_id: sessionId,
    });
  }

  /**
   * Track failed login attempts
   */
  private async trackFailedLogin(
    email: string,
    failureReason: string,
    request?: Request,
  ): Promise<void> {
    const deviceInfo = this.extractDeviceInfo(request);

    // Try to get user_id from email for tracking
    let userId: string | null = null;
    try {
      const user = await this.usersService.findByEmail(email);
      userId = user?.user_id || null;
    } catch {
      // User doesn't exist, track with null user_id
    }

    await this.analyticsService.trackUserLogin({
      user_id: userId,
      login_date: new Date(),
      ip_address: deviceInfo.ip_address || undefined,
      user_agent: request?.get('User-Agent') || undefined,
      device_type: deviceInfo.device_type || undefined,
      browser: deviceInfo.browser || undefined,
      location: deviceInfo.location || undefined,
      is_successful: false,
      failure_reason: failureReason,
    });
  }

  /**
   * Save refresh token
   */
  private async saveRefreshToken(
    userId: string,
    token: string,
    request?: Request,
  ): Promise<RefreshToken> {
    // Hash the refresh token before storing
    const saltRounds = 12;
    const hashedToken = await bcrypt.hash(token, saltRounds);

    const deviceInfo = this.extractDeviceInfo(request);

    const refreshToken = this.refreshTokenRepository.create({
      user_id: userId,
      token_hash: hashedToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ip_address: deviceInfo.ip_address || undefined,
      device_info: request?.get('User-Agent') || undefined,
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Set refresh token cookie
   */
  private setRefreshTokenCookie(response: Response, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      domain: isProduction ? undefined : 'localhost',
    });
  }

  async refreshToken(refreshTokenValue: string, response?: Response): Promise<RefreshTokenDto> {
    try {
      // Verify refresh token
      const rawPayload: unknown = this.jwtService.verify(refreshTokenValue, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Type guard for payload
      if (!this.isValidRefreshTokenPayload(rawPayload)) {
        // Log token validation failure to Sentry
        this.sentryService.logTokenEvent('refresh_failed', 'unknown', {
          reason: 'Invalid token format',
          tokenType: 'refresh',
        });
        throw new UnauthorizedException('Érvénytelen token formátum');
      }

      if (rawPayload.type !== 'refresh') {
        // Log token validation failure to Sentry
        this.sentryService.logTokenEvent('refresh_failed', rawPayload.sub, {
          reason: 'Invalid token type',
          expectedType: 'refresh',
          actualType: rawPayload.type,
        });
        throw new UnauthorizedException('Érvénytelen token típus');
      }

      // Check if refresh token exists in database and not revoked
      const storedTokens = await this.refreshTokenRepository.find({
        where: { user_id: rawPayload.sub, is_revoked: false },
        relations: ['user'],
      });

      if (!storedTokens.length) {
        // Log token validation failure to Sentry
        this.sentryService.logTokenEvent('refresh_failed', rawPayload.sub, {
          reason: 'No valid tokens found in database',
          tokenType: 'refresh',
        });
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
        // Log token validation failure to Sentry
        this.sentryService.logTokenEvent('refresh_failed', rawPayload.sub, {
          reason: 'Token hash mismatch',
          tokenType: 'refresh',
          storedTokensCount: storedTokens.length,
        });
        throw new UnauthorizedException('Érvénytelen refresh token');
      }

      // Check if token expired
      if (validToken.expires_at < new Date()) {
        await this.refreshTokenRepository.update(validToken.id, { is_revoked: true });
        // Log token validation failure to Sentry
        this.sentryService.logTokenEvent('refresh_failed', rawPayload.sub, {
          reason: 'Token expired',
          expiresAt: validToken.expires_at.toISOString(),
          tokenType: 'refresh',
        });
        throw new UnauthorizedException('A refresh token lejárt');
      }

      const user = validToken.user;

      // Check user status
      if (user.is_banned) {
        // Log security event to Sentry
        this.sentryService.logSecurityEvent('banned_user_token_refresh', {
          userId: user.user_id,
          email: user.email,
          banReason: user.ban_reason || 'Unspecified',
          timestamp: new Date().toISOString(),
        });
        throw new UnauthorizedException('A fiók tiltva van');
      }

      if (!user.is_active) {
        // Log security event to Sentry
        this.sentryService.logSecurityEvent('inactive_user_token_refresh', {
          userId: user.user_id,
          email: user.email,
          timestamp: new Date().toISOString(),
        });
        throw new UnauthorizedException('A fiók inaktív');
      }

      // Generate new tokens
      const { access_token, refresh_token } = this.generateTokens(user);
      const newRefreshToken = await this.saveRefreshToken(user.user_id, refresh_token);

      // Update session BEFORE revoking old token (for smoother transition)
      await this.sessionLifecycleService.updateSessionOnTokenRefresh(
        validToken.id,
        newRefreshToken.id,
      );

      // Configure token rotation strategy based on environment
      const gracePeriodEnabled = this.configService.get<boolean>('jwt.gracePeriodEnabled', true);
      const gracePeriodMs = this.configService.get<number>('jwt.gracePeriodMs', 30000); // 30 seconds default

      if (gracePeriodEnabled && gracePeriodMs > 0) {
        // Use grace period for smoother UX in concurrent request scenarios
        setTimeout(() => {
          void this.refreshTokenRepository.update(validToken.id, { is_revoked: true });
          // Log token revocation to Sentry
          this.sentryService.logTokenEvent('token_revoked', user.user_id, {
            tokenId: validToken.id,
            revocationReason: 'Token rotation grace period expired',
            gracePeriod: `${gracePeriodMs / 1000} seconds`,
            rotationStrategy: 'grace_period',
          });
        }, gracePeriodMs);

        // Log successful token rotation with grace period to Sentry
        this.sentryService.logTokenEvent('token_rotation', user.user_id, {
          oldTokenId: validToken.id,
          newTokenId: newRefreshToken.id,
          sessionUpdated: true,
          rotationReason: 'Successful refresh',
          rotationStrategy: 'grace_period',
          gracePeriodMs,
        });
      } else {
        // Immediate revocation for maximum security
        await this.refreshTokenRepository.update(validToken.id, { is_revoked: true });

        // Log immediate token rotation to Sentry
        this.sentryService.logTokenEvent('token_rotation', user.user_id, {
          oldTokenId: validToken.id,
          newTokenId: newRefreshToken.id,
          sessionUpdated: true,
          rotationReason: 'Successful refresh',
          rotationStrategy: 'immediate',
          oldTokenRevoked: true,
        });
      }

      if (response) {
        this.setRefreshTokenCookie(response, refresh_token);
      }

      return { access_token };
    } catch (error) {
      // Log generic refresh failure to Sentry if it's not already logged
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw if it's already logged above
      }

      this.sentryService.captureAuthError(error as Error, {
        operation: 'refresh_token',
        tokenPrefix: refreshTokenValue?.substring(0, 10) + '...',
      });
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

  /**
   * Enhanced logout with session termination
   */
  async logout(
    logoutDto: LogoutDto,
    userId: string,
    response?: Response,
  ): Promise<{ message: string }> {
    const refreshTokenValue = logoutDto.refresh_token;
    let sessionTerminated = false;
    let tokenRevoked = false;

    if (refreshTokenValue) {
      // Find and revoke the refresh token
      const storedTokens = await this.refreshTokenRepository.find({
        where: { user_id: userId, is_revoked: false },
      });

      for (const token of storedTokens) {
        const isValid = await bcrypt.compare(refreshTokenValue, token.token_hash);
        if (isValid) {
          // End session through lifecycle service
          await this.sessionLifecycleService.endSessionByRefreshToken(token.id);
          sessionTerminated = true;

          // Revoke token
          await this.refreshTokenRepository.update(token.id, { is_revoked: true });
          tokenRevoked = true;

          // Log successful session termination to Sentry
          this.sentryService.logTokenEvent('token_revoked', userId, {
            tokenId: token.id,
            revocationReason: 'User logout',
            sessionTerminated: true,
          });
          break;
        }
      }
    }

    // Clear refresh token cookie
    if (response) {
      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
    }

    // Log logout event to Sentry
    this.sentryService.logSecurityEvent('user_logout', {
      userId,
      sessionTerminated,
      tokenRevoked,
      logoutMethod: 'single_device',
      timestamp: new Date().toISOString(),
    });

    return { message: 'Sikeres kijelentkezés' };
  }

  /**
   * Logout user from all devices
   */
  async logoutAllDevices(userId: string): Promise<{ message: string; devicesLoggedOut: number }> {
    // Find all active refresh tokens for this user
    const activeTokens = await this.refreshTokenRepository.find({
      where: { user_id: userId, is_revoked: false },
    });

    // Find all active sessions for this user
    const activeSessions = await this.userSessionRepository.find({
      where: { user_id: userId, is_active: true },
    });

    // Revoke all refresh tokens
    await this.refreshTokenRepository.update(
      { user_id: userId, is_revoked: false },
      {
        is_revoked: true,
        used_at: new Date(),
      },
    );

    // End all active sessions
    await this.userSessionRepository.update(
      { user_id: userId, is_active: true },
      {
        session_end: new Date(),
        is_active: false,
        updated_at: new Date(),
      },
    );

    // Log bulk session termination to Sentry
    this.sentryService.logSecurityEvent('bulk_session_termination', {
      userId,
      tokensRevoked: activeTokens.length,
      sessionsTerminated: activeSessions.length,
      logoutMethod: 'all_devices',
      timestamp: new Date().toISOString(),
    });

    // Log token revocation events to Sentry
    if (activeTokens.length > 0) {
      this.sentryService.logTokenEvent('token_revoked', userId, {
        tokenCount: activeTokens.length,
        revocationReason: 'Logout from all devices',
        bulkRevocation: true,
      });
    }

    return {
      message: 'Sikeresen kijelentkezve minden eszközről',
      devicesLoggedOut: activeTokens.length,
    };
  }

  /**
   * End user session by refresh token
   */
  private async endUserSessionByRefreshToken(refreshTokenId: string): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: {
        refresh_token_id: refreshTokenId,
        is_active: true,
      },
    });

    if (session) {
      await this.userSessionRepository.update(session.id, {
        session_end: new Date(),
        is_active: false,
        updated_at: new Date(),
      });

      // Update the corresponding login record
      await this.updateLoginSessionEnd(session.user_id, session.session_start);
    }
  }

  /**
   * Update login record with session end time
   */
  private async updateLoginSessionEnd(userId: string, sessionStart: Date): Promise<void> {
    const loginRecord = await this.analyticsService.findLoginByUserAndTime(userId, sessionStart);

    if (loginRecord) {
      await this.analyticsService.updateLoginSessionEnd(loginRecord.id, new Date());
    }
  }

  /**
   * Generate session token
   */
  private generateSessionToken(): string {
    return this.jwtService.sign(
      { type: 'session', timestamp: Date.now() },
      {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: '24h',
      },
    );
  }

  /**
   * Extract device information from request
   */
  private extractDeviceInfo(request?: Request) {
    if (!request) {
      return {
        ip_address: null,
        device_type: null,
        browser: null,
        os: null,
        location: null,
        country: null,
        city: null,
      };
    }

    const userAgent = request.get('User-Agent') || '';
    const ip =
      request.ip ||
      request.get('X-Forwarded-For') ||
      request.get('X-Real-IP') ||
      request.connection?.remoteAddress;

    return {
      ip_address: ip,
      device_type: this.detectDeviceType(userAgent),
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
      location: null, // Can be enhanced with IP geolocation
      country: null,
      city: null,
    };
  }

  /**
   * Simple device type detection
   */
  private detectDeviceType(userAgent: string): string | null {
    if (!userAgent) return null;

    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Simple browser detection
   */
  private detectBrowser(userAgent: string): string | null {
    if (!userAgent) return null;

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';

    return 'Unknown';
  }

  /**
   * Simple OS detection
   */
  private detectOS(userAgent: string): string | null {
    if (!userAgent) return null;

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';

    return 'Unknown';
  }
}
