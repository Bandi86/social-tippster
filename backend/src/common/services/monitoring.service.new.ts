import { Injectable, Logger } from '@nestjs/common';

export interface SuspiciousActivityData {
  readonly userId?: string;
  readonly userEmail?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly activityType:
    | 'multiple_failed_logins'
    | 'rapid_login_attempts'
    | 'unusual_location'
    | 'session_hijacking'
    | 'brute_force_attack';
  readonly details: Readonly<Record<string, unknown>>;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly timestamp: Date;
}

export interface AuthEventData {
  readonly userId?: string;
  readonly userEmail?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly eventType: 'login' | 'logout' | 'token_refresh' | 'password_change';
  readonly success: boolean;
  readonly details: Readonly<Record<string, unknown>>;
  readonly timestamp: Date;
}

export interface AuthenticationData {
  readonly userId?: string;
  readonly userEmail?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly success: boolean;
  readonly failureReason?: string;
  readonly timestamp: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor() {
    this.logger.log('🔍 Monitoring Service initialized with console logging');
  }

  /**
   * Log suspicious activities with appropriate severity levels
   */
  logSuspiciousActivity(data: SuspiciousActivityData): void {
    try {
      const logLevel = this.mapSeverityToLogLevel(data.severity);

      this.logger[logLevel](`🚨 Suspicious Activity [${data.activityType.toUpperCase()}]:`, {
        userId: data.userId,
        email: this.sanitizeEmail(data.userEmail),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        severity: data.severity,
        details: this.sanitizeData(data.details),
        timestamp: data.timestamp.toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to log suspicious activity:', error);
    }
  }

  /**
   * Log authentication events
   */
  logAuthEvent(data: AuthEventData): void {
    try {
      const logLevel = data.success ? 'log' : 'warn';

      this.logger[logLevel](`🔐 Auth Event [${data.eventType.toUpperCase()}]:`, {
        userId: data.userId,
        email: this.sanitizeEmail(data.userEmail),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success,
        details: this.sanitizeData(data.details),
        timestamp: data.timestamp.toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to log auth event:', error);
    }
  }

  /**
   * Log security events with console output
   */
  logSecurityEvent(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: Record<string, unknown>,
  ): void {
    try {
      const logLevel = this.mapSeverityToLogLevel(severity);

      this.logger[logLevel](`🔒 Security Event: ${message}`, {
        severity,
        context: this.sanitizeData(context || {}),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Capture and log exceptions
   */
  captureException(error: Error, context?: Record<string, unknown>): void {
    try {
      this.logger.error('🚨 Exception captured:', {
        message: error.message,
        stack: error.stack,
        context: this.sanitizeData(context || {}),
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log exception:', logError);
    }
  }

  /**
   * Log authentication attempts
   */
  logAuthentication(data: AuthenticationData): void {
    try {
      const logLevel = data.success ? 'log' : 'warn';

      this.logger[logLevel](`🔐 Authentication [${data.success ? 'SUCCESS' : 'FAILED'}]:`, {
        userId: data.userId,
        email: this.sanitizeEmail(data.userEmail),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success,
        failureReason: data.failureReason,
        timestamp: data.timestamp.toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to log authentication:', error);
    }
  }

  /**
   * Set user context for logging
   */
  setUserContext({
    id,
    email,
    username,
    ipAddress,
  }: {
    id?: string;
    email?: string;
    username?: string;
    ipAddress?: string;
  }) {
    // In console logging, we just log the context change
    this.logger.log('👤 User context set:', {
      id,
      email: this.sanitizeEmail(email),
      username,
      ipAddress,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Map severity levels to logger levels
   */
  private mapSeverityToLogLevel(
    severity: 'low' | 'medium' | 'high' | 'critical',
  ): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
      default:
        return 'log';
    }
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: Readonly<Record<string, unknown>>): Record<string, unknown> {
    const sanitized = { ...data };
    const sensitiveFields = [
      'password',
      'token',
      'refreshToken',
      'access_token',
      'refresh_token',
      'apiKey',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitize email for logging
   */
  private sanitizeEmail(email?: string): string {
    if (!email || !email.includes('@')) return email || '[NO_EMAIL]';

    const [localPart, domain] = email.split('@');
    const maskedLocal =
      localPart.length > 2
        ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
        : localPart;

    return `${maskedLocal}@${domain}`;
  }

  /**
   * Check if object is valid for logging
   */
  private isValidObject(obj: unknown): obj is Record<string, unknown> {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  }
}
