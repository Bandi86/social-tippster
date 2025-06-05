import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryService {
  constructor(private readonly configService: ConfigService) {
    console.log('🔐 SentryService initialized with console logging (Sentry disabled)');
  }

  /**
   * Log authentication security events
   */
  logSecurityEvent(event: string, details: Record<string, any>): void {
    console.log(`🔐 Auth Security Event: ${event}`, {
      ...this.sanitizeData(details),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log failed authentication attempts
   */
  logFailedAuth(email: string, reason: string, ip?: string, userAgent?: string): void {
    console.warn(`🔐 Failed Auth: ${this.sanitizeEmail(email)} - ${reason}`, {
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log successful authentication events
   */
  logSuccessfulAuth(userId: string, email: string, ip?: string): void {
    console.log(`🔐 Successful Auth: ${userId}`, {
      email: this.sanitizeEmail(email),
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log suspicious activities
   */
  logSuspiciousActivity(
    type: 'brute_force' | 'token_theft' | 'unusual_location' | 'concurrent_sessions',
    details: Record<string, any>,
  ): void {
    console.error(`🔐 Suspicious Activity: ${type}`, {
      type,
      ...this.sanitizeData(details),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log token-related security events
   */
  logTokenEvent(
    event: 'refresh_attempted' | 'refresh_failed' | 'token_revoked' | 'token_rotation',
    userId: string,
    details?: Record<string, any>,
  ): void {
    const logLevel = event.includes('failed') ? 'warn' : 'log';
    console[logLevel](`🔐 Token Event: ${event} for user ${userId}`, {
      event,
      userId,
      ...this.sanitizeData(details || {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Capture authentication-related errors
   */
  captureAuthError(error: Error, context?: Record<string, any>): void {
    console.error('🔐 Auth Error:', {
      message: error.message,
      stack: error.stack,
      context: this.sanitizeData(context || {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Remove sensitive information from data
   */
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };

    // Remove or mask sensitive fields
    const sensitiveFields = ['password', 'token', 'refreshToken', 'access_token', 'refresh_token'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitize email for logging (mask part of it)
   */
  private sanitizeEmail(email: string): string {
    if (!email || !email.includes('@')) return '[INVALID_EMAIL]';

    const [localPart, domain] = email.split('@');
    const maskedLocal =
      localPart.length > 2
        ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
        : localPart;

    return `${maskedLocal}@${domain}`;
  }
}
