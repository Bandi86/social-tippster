import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../admin/analytics-dashboard/entities/user-session.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

export interface SessionExpiryPolicy {
  idle_timeout_minutes: number;
  absolute_timeout_hours: number;
  remember_me_days?: number;
  security_level: 'low' | 'medium' | 'high';
  access_token_expiry?: string;
  refresh_token_expiry?: string;
}

export interface SessionActivity {
  last_activity: Date;
  activity_count: number;
  is_idle: boolean;
  time_until_expiry: number;
}

@Injectable()
export class SessionExpiryService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Get session expiry policy based on user role and security requirements
   */
  getSessionExpiryPolicy(userRole: string, rememberMe = false): SessionExpiryPolicy {
    const policies: Record<string, SessionExpiryPolicy> = {
      admin: {
        idle_timeout_minutes: 30,
        absolute_timeout_hours: 8,
        security_level: 'high',
      },
      user: {
        idle_timeout_minutes: 60,
        absolute_timeout_hours: 24,
        remember_me_days: rememberMe ? 30 : undefined,
        security_level: 'medium',
      },
    };

    // Always return a valid SessionExpiryPolicy object
    if (userRole in policies) {
      return policies[userRole];
    }
    return policies.user;
  }

  /**
   * Update session activity and check for expiry
   */
  async updateSessionActivity(sessionId: string): Promise<SessionActivity> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId, is_active: true },
      relations: ['user'],
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const policy = this.getSessionExpiryPolicy(session.user.role);
    const now = new Date();

    // Update last activity
    await this.userSessionRepository.update(sessionId, {
      last_activity: now,
      activity_count: (session.activity_count || 0) + 1,
      updated_at: now,
    });

    // Check if session should expire
    const sessionAge = now.getTime() - session.session_start.getTime();
    const idleTime =
      now.getTime() - (session.last_activity?.getTime() || session.session_start.getTime());

    const maxSessionMs = policy.absolute_timeout_hours * 60 * 60 * 1000;
    const maxIdleMs = policy.idle_timeout_minutes * 60 * 1000;

    const sessionExpired = sessionAge > maxSessionMs;
    const isIdle = idleTime > maxIdleMs;

    if (sessionExpired || isIdle) {
      await this.expireSession(sessionId, sessionExpired ? 'absolute_timeout' : 'idle_timeout');
    }

    return {
      last_activity: now,
      activity_count: (session.activity_count || 0) + 1,
      is_idle: isIdle,
      time_until_expiry: isIdle ? 0 : Math.max(0, maxIdleMs - idleTime),
    };
  }

  /**
   * Extend session expiry (for remember me or activity)
   */
  async extendSession(sessionId: string, extensionHours = 24): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId, is_active: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Extend refresh token expiry if token exists
    if (session.refresh_token_id) {
      await this.refreshTokenRepository.update(
        { id: session.refresh_token_id },
        {
          expires_at: new Date(Date.now() + extensionHours * 60 * 60 * 1000),
        },
      );
    }

    // Update session
    await this.userSessionRepository.update(sessionId, {
      extended_at: new Date(),
      extension_count: (session.extension_count || 0) + 1,
      updated_at: new Date(),
    });
  }

  /**
   * Expire session with reason
   */
  async expireSession(sessionId: string, reason: string): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId, is_active: true },
    });

    if (!session) {
      return; // Already expired
    }

    // End session
    await this.userSessionRepository.update(sessionId, {
      session_end: new Date(),
      is_active: false,
      expiry_reason: reason,
      updated_at: new Date(),
    });

    // Revoke associated refresh token
    if (session.refresh_token_id) {
      await this.refreshTokenRepository.update(session.refresh_token_id, {
        is_revoked: true,
        revoked_at: new Date(),
        revoke_reason: reason,
      });
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.userSessionRepository
      .createQueryBuilder('session')
      .leftJoin('session.refresh_token', 'token')
      .where('session.is_active = :active', { active: true })
      .andWhere('(token.expires_at < :now OR session.session_start < :absoluteExpiry)', {
        now: new Date(),
        absoluteExpiry: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days max
      })
      .getMany();

    for (const session of expiredSessions) {
      await this.expireSession(session.id, 'cleanup_expired');
    }

    return expiredSessions.length;
  }

  /**
   * Get session status and time remaining
   */
  async getSessionStatus(sessionId: string): Promise<{
    is_active: boolean;
    time_until_idle_expiry: number;
    time_until_absolute_expiry: number;
    policy: SessionExpiryPolicy;
  }> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });

    if (!session || !session.is_active) {
      return {
        is_active: false,
        time_until_idle_expiry: 0,
        time_until_absolute_expiry: 0,
        policy: this.getSessionExpiryPolicy('user'),
      };
    }

    const policy = this.getSessionExpiryPolicy(session.user.role);
    const now = new Date();

    const sessionAge = now.getTime() - session.session_start.getTime();
    const idleTime =
      now.getTime() - (session.last_activity?.getTime() || session.session_start.getTime());

    const maxSessionMs = policy.absolute_timeout_hours * 60 * 60 * 1000;
    const maxIdleMs = policy.idle_timeout_minutes * 60 * 1000;

    return {
      is_active: true,
      time_until_idle_expiry: Math.max(0, maxIdleMs - idleTime),
      time_until_absolute_expiry: Math.max(0, maxSessionMs - sessionAge),
      policy,
    };
  }
}
