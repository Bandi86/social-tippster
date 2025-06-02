import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { UserSession } from 'src/modules/admin/analytics-dashboard/entities/user-session.entity';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../../admin/analytics-dashboard/analytics.service';
import { RefreshToken } from '../entities/refresh-token.entity';

// Add DeviceFingerprint interface import
export interface DeviceFingerprint {
  fingerprint_hash: string;
  user_agent: string;
  ip_address: string;
  device_type: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
  hardware_concurrency?: number;
  memory?: number;
  color_depth?: number;
  pixel_ratio?: number;
}

@Injectable()
export class SessionLifecycleService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async createSessionWithToken(
    userId: string,
    refreshTokenId: string,
    sessionData: {
      deviceType?: string;
      browser?: string;
      location?: string;
      ipAddress?: string;
    },
  ): Promise<UserSession> {
    const sessionToken = this.generateSessionToken();

    const session = this.userSessionRepository.create({
      user_id: userId,
      session_token: sessionToken,
      refresh_token_id: refreshTokenId,
      device_type: sessionData.deviceType,
      browser: sessionData.browser,
      location: sessionData.location,
      session_start: new Date(),
      is_active: true,
    });

    const savedSession = await this.userSessionRepository.save(session);

    // Track in analytics
    await this.analyticsService.trackUserLogin({
      user_id: userId,
      session_id: savedSession.id,
      session_start: new Date(),
      ip_address: sessionData.ipAddress,
      device_type: sessionData.deviceType,
      browser: sessionData.browser,
      is_successful: true,
    });

    return savedSession;
  }

  /**
   * Create session with device fingerprint
   */
  async createSessionWithFingerprint(
    userId: string,
    refreshTokenId: string,
    deviceFingerprint: DeviceFingerprint,
  ): Promise<UserSession> {
    const sessionToken = this.generateSessionToken();

    const session = this.userSessionRepository.create({
      user_id: userId,
      session_token: sessionToken,
      refresh_token_id: refreshTokenId,
      device_type: deviceFingerprint.device_type,
      browser: deviceFingerprint.browser,
      location: undefined, // Will be added later if needed
      session_start: new Date(),
      is_active: true,
      fingerprint_hash: deviceFingerprint.fingerprint_hash,
      device_fingerprint: deviceFingerprint,
    });

    const savedSession = await this.userSessionRepository.save(session);

    // Track in analytics
    await this.analyticsService.trackUserLogin({
      user_id: userId,
      session_id: savedSession.id,
      session_start: new Date(),
      ip_address: deviceFingerprint.ip_address,
      device_type: deviceFingerprint.device_type,
      browser: deviceFingerprint.browser,
      is_successful: true,
    });

    return savedSession;
  }

  async updateSessionOnTokenRefresh(
    oldRefreshTokenId: string,
    newRefreshTokenId: string,
  ): Promise<void> {
    // Update session to point to new refresh token
    const session = await this.userSessionRepository.findOne({
      where: { refresh_token_id: oldRefreshTokenId, is_active: true },
    });

    if (session) {
      await this.userSessionRepository.update(session.id, {
        refresh_token_id: newRefreshTokenId,
        updated_at: new Date(),
      });
    }
  }

  async endSessionByRefreshToken(refreshTokenId: string): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { refresh_token_id: refreshTokenId, is_active: true },
    });

    if (session) {
      // Calculate session duration
      const sessionDuration = new Date().getTime() - session.session_start.getTime();

      await this.userSessionRepository.update(session.id, {
        session_end: new Date(),
        is_active: false,
        updated_at: new Date(),
        // Optional: Add session_duration_ms field
        // session_duration_ms: sessionDuration,
      });

      // Enhanced analytics with session duration
      await this.analyticsService.updateLoginSessionEnd(session.id, new Date());

      console.log(
        `Session ended for user ${session.user_id}, duration: ${Math.round(sessionDuration / 1000 / 60)} minutes`,
      );
    }
  }

  async endAllUserSessions(userId: string): Promise<number> {
    const activeSessions = await this.userSessionRepository.find({
      where: { user_id: userId, is_active: true },
    });

    await this.userSessionRepository.update(
      { user_id: userId, is_active: true },
      {
        session_end: new Date(),
        is_active: false,
        updated_at: new Date(),
      },
    );

    // Update analytics for all sessions
    for (const session of activeSessions) {
      await this.analyticsService.updateLoginSessionEnd(session.id, new Date());
    }

    return activeSessions.length;
  }

  private generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }
}
