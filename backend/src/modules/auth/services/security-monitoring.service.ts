import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

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
  private readonly sentryEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.sentryEnabled = !!this.configService.get<string>('SENTRY_DSN');

    if (this.sentryEnabled) {
      Sentry.init({
        dsn: this.configService.get<string>('SENTRY_DSN'),
        environment: this.configService.get<string>('NODE_ENV') || 'development',
        tracesSampleRate: 1.0,
      });
    }
  }

  /**
   * Log security events with appropriate severity levels
   */
  logSecurityEvent(event: SecurityEvent): void {
    try {
      // Console logging for development
      console.warn(`🔒 Security Event [${event.type.toUpperCase()}]:`, {
        severity: event.severity,
        userId: event.userId,
        email: event.email,
        ipAddress: event.ipAddress,
        details: event.details,
      });

      // Sentry logging for production monitoring
      if (this.sentryEnabled) {
        Sentry.withScope(scope => {
          scope.setTag('securityEvent', event.type);
          scope.setLevel(this.mapSeverityToSentryLevel(event.severity));

          if (event.userId) {
            scope.setUser({ id: event.userId, email: event.email });
          }

          scope.setContext('security', {
            eventType: event.type,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            ...event.details,
          });

          Sentry.captureMessage(`Security Event: ${event.type}`, event.severity as any);
        });
      }

      // TODO: Add additional monitoring integrations here
      // - Database logging for audit trails
      // - Email alerts for critical events
      // - Slack notifications for high severity events
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log failed login attempts
   */
  async logFailedLogin(
    email: string,
    ipAddress: string,
    userAgent: string,
    failureReason: string,
    attemptCount?: number,
  ): Promise<void> {
    const severity = attemptCount && attemptCount >= 3 ? 'high' : 'medium';

    await this.logSecurityEvent({
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
  async logSuspiciousLogin(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent: string,
    suspiciousChanges: string[],
    similarityScore: number,
  ): Promise<void> {
    await this.logSecurityEvent({
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
  async logTokenValidationFailure(
    token: string,
    ipAddress: string,
    userAgent: string,
    error: string,
  ): Promise<void> {
    await this.logSecurityEvent({
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
  async logCSRFViolation(
    userId: string,
    ipAddress: string,
    userAgent: string,
    endpoint: string,
  ): Promise<void> {
    await this.logSecurityEvent({
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
  async logBruteForceAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    attemptCount: number,
    isBlocked: boolean,
  ): Promise<void> {
    await this.logSecurityEvent({
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
   * Capture exceptions with Sentry
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (this.sentryEnabled) {
      Sentry.withScope(scope => {
        if (context) {
          scope.setContext('additional', context);
        }
        Sentry.captureException(error);
      });
    }
    console.error('Security Exception:', error, context);
  }

  /**
   * Map severity levels to Sentry levels
   */
  private mapSeverityToSentryLevel(severity: SecurityEvent['severity']): Sentry.SeverityLevel {
    switch (severity) {
      case 'critical':
        return 'fatal';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'info';
    }
  }
}
