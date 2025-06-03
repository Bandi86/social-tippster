import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService {
  private isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('sentry.enabled', false);

    if (this.isEnabled) {
      this.initializeSentry();
    }
  }

  private initializeSentry(): void {
    const dsn = this.configService.get<string>('sentry.dsn');
    const environment = this.configService.get<string>('sentry.environment');

    if (!dsn) {
      console.warn('Sentry DSN not configured. Error tracking will be disabled.');
      this.isEnabled = false;
      return;
    }

    Sentry.init({
      dsn,
      environment,
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Security and auth specific configurations
      beforeSend(event) {
        // Filter out sensitive data from error reports
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    console.log(`Sentry initialized for environment: ${environment}`);
  }

  /**
   * Log authentication security events
   */
  logSecurityEvent(event: string, details: Record<string, any>): void {
    if (!this.isEnabled) return;

    Sentry.addBreadcrumb({
      category: 'auth.security',
      message: event,
      level: 'warning',
      data: this.sanitizeData(details),
    });
  }

  /**
   * Log failed authentication attempts
   */
  logFailedAuth(email: string, reason: string, ip?: string, userAgent?: string): void {
    if (!this.isEnabled) return;

    Sentry.withScope(scope => {
      scope.setTag('event_type', 'auth_failed');
      scope.setLevel('warning');
      scope.setContext('auth_attempt', {
        email: this.sanitizeEmail(email),
        reason,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      Sentry.captureMessage(`Failed authentication attempt for ${this.sanitizeEmail(email)}`);
    });
  }

  /**
   * Log successful authentication events
   */
  logSuccessfulAuth(userId: string, email: string, ip?: string): void {
    if (!this.isEnabled) return;

    Sentry.addBreadcrumb({
      category: 'auth.success',
      message: 'Successful authentication',
      level: 'info',
      data: {
        userId,
        email: this.sanitizeEmail(email),
        ip,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log suspicious activities
   */
  logSuspiciousActivity(
    type: 'brute_force' | 'token_theft' | 'unusual_location' | 'concurrent_sessions',
    details: Record<string, any>,
  ): void {
    if (!this.isEnabled) return;

    Sentry.withScope(scope => {
      scope.setTag('event_type', 'suspicious_activity');
      scope.setTag('activity_type', type);
      scope.setLevel('error');
      scope.setContext('security_alert', {
        type,
        ...this.sanitizeData(details),
        timestamp: new Date().toISOString(),
      });

      Sentry.captureMessage(`Suspicious activity detected: ${type}`);
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
    if (!this.isEnabled) return;

    Sentry.addBreadcrumb({
      category: 'auth.token',
      message: `Token event: ${event}`,
      level: event.includes('failed') ? 'warning' : 'info',
      data: {
        event,
        userId,
        ...this.sanitizeData(details || {}),
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Capture authentication-related errors
   */
  captureAuthError(error: Error, context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    Sentry.withScope(scope => {
      scope.setTag('error_type', 'auth_error');
      scope.setContext('auth_context', this.sanitizeData(context || {}));
      Sentry.captureException(error);
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
