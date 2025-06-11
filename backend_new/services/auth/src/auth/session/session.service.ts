import { Injectable, Logger } from '@nestjs/common';
import { FreshUserDataService } from '../user/fresh-user-data.service';
import { generateSecureId } from '../utils/crypto.util';
import { RedisSessionService } from './redis-session.service';
import { ISessionService } from './session.interface';

/**
 * Modern Session Service
 *
 * Implementálja az elvárásokat:
 * ✅ Session csak userId-t tárol
 * ✅ SSR API minden fetch-nél lekérdezi a DB-t
 * ✅ cookie.maxAge be van állítva
 * ✅ Ha nincs user, a session-t törlöd
 *
 * REDIS-alapú, minimális session adatok
 */

@Injectable()
export class SessionService implements ISessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly redisSession: RedisSessionService,
    private readonly freshUserData: FreshUserDataService,
  ) {}

  /**
   * Create a new session - csak userId tárolás
   */
  async createSession(userId: string, token?: string): Promise<{ sessionId: string }> {
    try {
      // Validate user exists and is active FIRST
      const isValidUser = await this.freshUserData.isUserValid(userId);
      if (!isValidUser) {
        throw new Error('Invalid user - cannot create session');
      }

      // Generate secure session ID
      const sessionId = generateSecureId();

      // Store only userId in Redis
      await this.redisSession.createSession(sessionId, userId);

      // Update user online status
      await this.freshUserData.updateUserOnlineStatus(userId, true);

      this.logger.log(`Session created for user ${userId}: ${sessionId}`);
      return { sessionId };
    } catch (error) {
      this.logger.error(`Failed to create session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find session and get fresh user data
   */
  async findValidSession(sessionId: string): Promise<{ userId: string; userData: any } | null> {
    try {
      // Get session from Redis
      const sessionData = await this.redisSession.getSession(sessionId);
      if (!sessionData) {
        return null;
      }

      // Get FRESH user data from DB (never cached!)
      const userData = await this.freshUserData.validateAndGetFreshUser(sessionData.userId);

      return {
        userId: sessionData.userId,
        userData,
      };
    } catch (error) {
      this.logger.error(`Session validation failed for ${sessionId}:`, error);

      // If user is invalid, delete the session
      await this.redisSession.deleteSession(sessionId);
      return null;
    }
  }

  /**
   * Invalidate session (logout)
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    try {
      // Get user ID before deleting session (for online status update)
      const sessionData = await this.redisSession.getSession(sessionId);

      const success = await this.redisSession.deleteSession(sessionId);

      if (success && sessionData) {
        // Update user offline status
        await this.freshUserData.updateUserOnlineStatus(sessionData.userId, false);
        this.logger.log(`Session invalidated: ${sessionId}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Failed to invalidate session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Rotate session - create new sessionId, keep userId
   */
  async rotateSession(oldSessionId: string): Promise<{ sessionId: string } | null> {
    try {
      // Get current session data
      const sessionData = await this.redisSession.getSession(oldSessionId);
      if (!sessionData) {
        return null;
      }

      // Validate user is still valid
      const isValidUser = await this.freshUserData.isUserValid(sessionData.userId);
      if (!isValidUser) {
        // User is no longer valid, delete session
        await this.redisSession.deleteSession(oldSessionId);
        return null;
      }

      // Create new session
      const newSessionId = generateSecureId();
      await this.redisSession.createSession(newSessionId, sessionData.userId);

      // Delete old session
      await this.redisSession.deleteSession(oldSessionId);

      this.logger.log(`Session rotated from ${oldSessionId} to ${newSessionId}`);
      return { sessionId: newSessionId };
    } catch (error) {
      this.logger.error(`Failed to rotate session ${oldSessionId}:`, error);
      return null;
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string): Promise<number> {
    try {
      const count = await this.redisSession.deleteAllUserSessions(userId);

      if (count > 0) {
        // Update user offline status
        await this.freshUserData.updateUserOnlineStatus(userId, false);
        this.logger.log(`Invalidated ${count} sessions for user ${userId}`);
      }

      return count;
    } catch (error) {
      this.logger.error(`Failed to invalidate all sessions for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get active sessions for user - returns only session IDs
   */
  async getUserActiveSessions(userId: string): Promise<string[]> {
    try {
      return await this.redisSession.getUserActiveSessions(userId);
    } catch (error) {
      this.logger.error(`Failed to get active sessions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Validate session with fresh user data check
   */
  async validateSessionWithFingerprint(
    sessionId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ userId: string; userData: any } | null> {
    // We don't store IP/UserAgent anymore, just validate session + fresh user data
    return this.findValidSession(sessionId);
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId: string): Promise<boolean> {
    try {
      return await this.redisSession.extendSession(sessionId);
    } catch (error) {
      this.logger.error(`Failed to extend session ${sessionId}:`, error);
      return false;
    }
  }

  // Interface implementations for ISessionService
  async getSession(sessionId: string): Promise<{ userId: string } | null> {
    const sessionData = await this.redisSession.getSession(sessionId);
    return sessionData ? { userId: sessionData.userId } : null;
  }

  async isValidSession(sessionId: string): Promise<boolean> {
    return await this.redisSession.isValidSession(sessionId);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.redisSession.deleteSession(sessionId);
  }

  async deleteAllUserSessions(userId: string): Promise<number> {
    return await this.redisSession.deleteAllUserSessions(userId);
  }

  async healthCheck(): Promise<boolean> {
    return await this.redisSession.healthCheck();
  }

  /**
   * Cleanup - REDIS TTL handles this automatically
   */
  async cleanupExpiredSessions(): Promise<number> {
    return await this.redisSession.cleanupExpiredSessions();
  }

  /**
   * Mark session as expired - not needed with Redis TTL
   */
  async markSessionExpired(sessionId: string): Promise<boolean> {
    return await this.deleteSession(sessionId);
  }
}
