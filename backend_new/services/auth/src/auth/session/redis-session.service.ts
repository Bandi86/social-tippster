import { Injectable, Logger } from '@nestjs/common';
import { RedisConfig } from '../../config/redis.config';

export interface SimpleSessionData {
  userId: string;
  createdAt: string;
}

/**
 * REDIS-based Session Service
 *
 * Follows the principle: "Session csak userId-t tárol"
 * - Minimális session adatok tárolása
 * - Automatikus TTL kezelés
 * - Friss user adatok minden API hívásnál
 */
@Injectable()
export class RedisSessionService {
  private readonly logger = new Logger(RedisSessionService.name);
  private readonly SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(private readonly redisConfig: RedisConfig) {}

  private get redis() {
    return this.redisConfig.getClient();
  }

  /**
   * Create a new session
   * Csak userId-t tárol, minden más adat frissen kérdezve
   */
  async createSession(sessionId: string, userId: string): Promise<void> {
    try {
      const sessionData: SimpleSessionData = {
        userId,
        createdAt: new Date().toISOString(),
      };

      await this.redis.setex(`session:${sessionId}`, this.SESSION_TTL, JSON.stringify(sessionData));

      this.logger.log(`Session created for user ${userId}: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to create session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get session data by sessionId
   * Csak userId-t ad vissza, minden más adat külön kérdezendő
   */
  async getSession(sessionId: string): Promise<SimpleSessionData | null> {
    try {
      const sessionData = await this.redis.get(`session:${sessionId}`);

      if (!sessionData) {
        return null;
      }

      return JSON.parse(sessionData);
    } catch (error) {
      this.logger.error(`Failed to get session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Check if session exists and is valid
   */
  async isValidSession(sessionId: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(`session:${sessionId}`);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Delete session (logout)
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const result = await this.redis.del(`session:${sessionId}`);
      const success = result === 1;

      if (success) {
        this.logger.log(`Session deleted: ${sessionId}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Failed to delete session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllUserSessions(userId: string): Promise<number> {
    try {
      const pattern = 'session:*';
      const keys = await this.redis.keys(pattern);
      let deletedCount = 0;

      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          const parsed: SimpleSessionData = JSON.parse(sessionData);
          if (parsed.userId === userId) {
            await this.redis.del(key);
            deletedCount++;
          }
        }
      }

      this.logger.log(`Deleted ${deletedCount} sessions for user ${userId}`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to delete all sessions for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<string[]> {
    try {
      const pattern = 'session:*';
      const keys = await this.redis.keys(pattern);
      const userSessions: string[] = [];

      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          const parsed: SimpleSessionData = JSON.parse(sessionData);
          if (parsed.userId === userId) {
            // Extract sessionId from key (remove 'session:' prefix)
            const sessionId = key.substring(8);
            userSessions.push(sessionId);
          }
        }
      }

      return userSessions;
    } catch (error) {
      this.logger.error(`Failed to get active sessions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Extend session TTL (refresh)
   */
  async extendSession(sessionId: string): Promise<boolean> {
    try {
      const result = await this.redis.expire(`session:${sessionId}`, this.SESSION_TTL);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to extend session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{ totalSessions: number; activeUsers: Set<string> }> {
    try {
      const pattern = 'session:*';
      const keys = await this.redis.keys(pattern);
      const activeUsers = new Set<string>();

      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          const parsed: SimpleSessionData = JSON.parse(sessionData);
          activeUsers.add(parsed.userId);
        }
      }

      return {
        totalSessions: keys.length,
        activeUsers,
      };
    } catch (error) {
      this.logger.error('Failed to get session stats:', error);
      return { totalSessions: 0, activeUsers: new Set() };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Cleanup - Redis TTL handles this automatically
   * This method exists for compatibility but does nothing
   */
  async cleanupExpiredSessions(): Promise<number> {
    this.logger.log('Redis TTL automatically handles session cleanup');
    return 0;
  }

  /**
   * Close Redis connection
   */
  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }
}
