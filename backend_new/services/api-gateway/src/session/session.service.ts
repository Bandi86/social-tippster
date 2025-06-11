import { Injectable, Logger } from '@nestjs/common';
import { RedisConfig } from '../config/redis.config';

export interface SessionData {
  userId: string;
  createdAt: string;
}

export interface UserContextData {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
}

/**
 * Session Service for API Gateway
 *
 * Connects directly to Redis for fast session validation
 * Bypasses auth service for performance improvements
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly redisConfig: RedisConfig) {}

  private get redis() {
    return this.redisConfig.getClient();
  }

  /**
   * Validate session and extract user ID
   * Only validates session existence, user data fetched separately
   */
  async validateSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `session:${sessionId}`;
      const sessionData = await this.redis.get(sessionKey);

      if (!sessionData) {
        return null;
      }

      const parsed: SessionData = JSON.parse(sessionData);

      // Extend session TTL on each access (activity-based extension)
      await this.redis.expire(sessionKey, 7 * 24 * 60 * 60); // 7 days

      return parsed;
    } catch (error) {
      this.logger.error(`Failed to validate session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Check if session exists without returning data
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(`session:${sessionId}`);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Get session statistics for monitoring
   */
  async getSessionStats(): Promise<{ totalSessions: number; activeUsers: Set<string> }> {
    try {
      const pattern = 'session:*';
      const keys = await this.redis.keys(pattern);
      const activeUsers = new Set<string>();

      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          const parsed: SessionData = JSON.parse(sessionData);
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
   * Health check for Redis connection
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
}
