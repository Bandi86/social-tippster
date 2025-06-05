import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SecurityEvent {
  type:
    | 'failed_login'
    | 'suspicious_login'
    | 'token_validation_failure'
    | 'csrf_violation'
    | 'brute_force_attempt';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class SecurityMonitoringService {
  constructor(private readonly configService: ConfigService) {
    console.log('🔒 Security Monitoring Service initialized with console logging');
  }

  /**
   * Log security events with appropriate severity levels
   */
  logSecurityEvent(event: SecurityEvent): void {
    try {
      // Console logging for all environments
      const logLevel = this.mapSeverityToLogLevel(event.severity);
      console[logLevel](`🔒 Security Event [${event.type.toUpperCase()}]:`, {
        severity: event.severity,
        userId: event.userId,
        email: event.email,
        ipAddress: event.ipAddress,
        details: event.details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log failed login attempts
   */
  logFailedLogin(
    email: string,
    ipAddress: string,
    userAgent: string,
    failureReason: string,
    attemptCount?: number,
  ): void {
    const severity = attemptCount && attemptCount >= 3 ? 'high' : 'medium';

    this.logSecurityEvent({
      type: 'failed_login',
      email,
      ipAddress,
      userAgent,
      severity,
      details: {
        failureReason,
        attemptCount,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log suspicious login patterns
   */
  logSuspiciousLogin(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent: string,
    suspiciousChanges: string[],
    similarityScore: number,
  ): void {
    this.logSecurityEvent({
      type: 'suspicious_login',
      userId,
      email,
      ipAddress,
      userAgent,
      severity: 'high',
      details: {
        suspiciousChanges,
        similarityScore,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log token validation failures
   */
  logTokenValidationFailure(
    token: string,
    ipAddress: string,
    userAgent: string,
    error: string,
  ): void {
    this.logSecurityEvent({
      type: 'token_validation_failure',
      ipAddress,
      userAgent,
      severity: 'medium',
      details: {
        tokenPrefix: token.substring(0, 10) + '...',
        error,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log CSRF protection violations
   */
  logCSRFViolation(userId: string, ipAddress: string, userAgent: string, endpoint: string): void {
    this.logSecurityEvent({
      type: 'csrf_violation',
      userId,
      ipAddress,
      userAgent,
      severity: 'critical',
      details: {
        endpoint,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log brute force attempts
   */
  logBruteForceAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    attemptCount: number,
    isBlocked: boolean,
  ): void {
    this.logSecurityEvent({
      type: 'brute_force_attempt',
      email,
      ipAddress,
      userAgent,
      severity: isBlocked ? 'critical' : 'high',
      details: {
        attemptCount,
        isBlocked,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Capture exceptions with console logging
   */
  captureException(error: Error, context?: Record<string, any>): void {
    console.error('🔒 Security Exception:', {
      message: error.message,
      stack: error.stack,
      context: context || {},
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Map severity levels to console log levels
   */
  private mapSeverityToLogLevel(severity: SecurityEvent['severity']): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
      default:
        return 'info';
    }
  }
}
