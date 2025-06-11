/**
 * Simplified Session Interfaces
 *
 * Following the principle: "Session csak userId-t tárol"
 * All other data should be fetched fresh from the database
 */

export interface MinimalSessionData {
  userId: string;
  sessionId: string;
  createdAt: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  userId?: string;
  sessionId?: string;
}

export interface ISessionService {
  /**
   * Create a new session with minimal data - generates sessionId and returns it
   */
  createSession(userId: string, token?: string): Promise<{ sessionId: string }>;

  /**
   * Get session data (only userId)
   */
  getSession(sessionId: string): Promise<{ userId: string } | null>;

  /**
   * Check if session is valid
   */
  isValidSession(sessionId: string): Promise<boolean>;

  /**
   * Delete session (logout)
   */
  deleteSession(sessionId: string): Promise<boolean>;

  /**
   * Delete all sessions for a user
   */
  deleteAllUserSessions(userId: string): Promise<number>;

  /**
   * Get active session IDs for a user
   */
  getUserActiveSessions(userId: string): Promise<string[]>;

  /**
   * Extend session TTL
   */
  extendSession(sessionId: string): Promise<boolean>;

  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;
}
