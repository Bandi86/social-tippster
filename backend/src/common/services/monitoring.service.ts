import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

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
  readonly timestamp: Date;
  readonly additionalInfo?: Readonly<Record<string, unknown>>;
}

export const AUTH_EVENT_TYPES = [
  'login_success',
  'login_failure',
  'logout',
  'token_refresh',
] as const;

export type AuthEventType = (typeof AUTH_EVENT_TYPES)[number];
export type SuspiciousActivityType = SuspiciousActivityData['activityType'];
export type SecuritySeverity = SuspiciousActivityData['severity'];

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  /**
   * Log suspicious activity to Sentry for real-time monitoring and alerting
   */
  logSuspiciousActivity(data: SuspiciousActivityData): void {
    try {
      if (!this.isValidSuspiciousActivityData(data)) {
        this.logger.error('Invalid suspicious activity data: missing required fields');
        return;
      }
      if (data.userId || data.userEmail) {
        this.setSentryUserContext({
          id: data.userId,
          email: data.userEmail,
          ip_address: data.ipAddress,
        });
      }
      const contextData: Record<string, unknown> = {
        activity_type: data.activityType,
        severity: data.severity,
        timestamp: data.timestamp.toISOString(),
        ip_address: data.ipAddress ?? 'unknown',
        user_agent: data.userAgent ?? 'unknown',
      };
      if (this.isValidObject(data.details)) {
        Object.assign(contextData, data.details);
      }
      Sentry.setContext('suspicious_activity', contextData);
      Sentry.setTag('activity_type', data.activityType);
      Sentry.setTag('severity', data.severity);
      Sentry.setTag('security_alert', 'true');
      const sentryLevel = this.mapSeverityToSentryLevel(data.severity);
      Sentry.captureMessage(`Suspicious Activity Detected: ${data.activityType}`, sentryLevel);
      this.logger.warn(`[SECURITY ALERT] ${data.activityType}`, {
        userId: data.userId ?? 'unknown',
        userEmail: data.userEmail ?? 'unknown',
        severity: data.severity,
        timestamp: data.timestamp.toISOString(),
        details: data.details,
      });
    } catch (error) {
      this.logger.error('Failed to log suspicious activity to Sentry', error);
    }
  }

  /**
   * Log authentication events for monitoring
   */
  logAuthEvent(eventType: AuthEventType, data: AuthEventData): void {
    try {
      if (!this.isValidAuthEventData(data)) {
        this.logger.error('Invalid auth event data: missing required fields');
        return;
      }
      const breadcrumbData: Record<string, unknown> = {
        user_id: data.userId ?? 'anonymous',
        user_email: data.userEmail ?? 'unknown',
        ip_address: data.ipAddress ?? 'unknown',
        user_agent: data.userAgent ?? 'unknown',
        timestamp: data.timestamp.toISOString(),
      };
      if (this.isValidObject(data.additionalInfo)) {
        Object.assign(breadcrumbData, data.additionalInfo);
      }
      Sentry.addBreadcrumb({
        message: `Auth Event: ${eventType}`,
        category: 'auth',
        level: 'info',
        data: breadcrumbData,
      });
      this.logger.log(`[AUTH EVENT] ${eventType}`, {
        userId: data.userId ?? 'anonymous',
        timestamp: data.timestamp.toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to log auth event to Sentry', error);
    }
  }

  /**
   * Log general security events
   */
  logSecurityEvent(
    message: string,
    data: Readonly<Record<string, unknown>> = {},
    severity: SecuritySeverity = 'medium',
  ): void {
    try {
      if (!this.isValidString(message)) {
        this.logger.error('Invalid security event: message must be a non-empty string');
        return;
      }
      const contextData = this.isValidObject(data) ? { ...data } : {};
      Sentry.setContext('security_event', {
        ...contextData,
        severity,
        timestamp: new Date().toISOString(),
      });
      Sentry.setTag('security_event', 'true');
      Sentry.setTag('severity', severity);
      const sentryLevel = this.mapSeverityToSentryLevel(severity);
      Sentry.captureMessage(`Security Event: ${message}`, sentryLevel);
      this.logger.warn(`[SECURITY EVENT] ${message}`, {
        severity,
        data: contextData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to log security event to Sentry', error);
    }
  }

  /**
   * Capture errors with additional context
   */
  captureError(error: unknown, context: Readonly<Record<string, unknown>> = {}): void {
    try {
      const errorToCapture = this.normalizeError(error);
      const safeContext = this.isValidObject(context) ? { ...context } : {};
      Sentry.setContext('error_context', {
        ...safeContext,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureException(errorToCapture);
      this.logger.error('[ERROR CAPTURED]', {
        error: errorToCapture.message,
        stack: errorToCapture.stack,
        context: safeContext,
      });
    } catch (sentryError) {
      this.logger.error('Failed to capture error in Sentry', sentryError);
    }
  }

  /**
   * Check if Sentry is properly initialized
   */
  isSentryInitialized(): boolean {
    try {
      return typeof Sentry.captureException === 'function';
    } catch {
      return false;
    }
  }

  /**
   * Set user context for all subsequent Sentry events
   */
  setUserContext(user: {
    readonly id?: string;
    readonly email?: string;
    readonly username?: string;
    readonly ipAddress?: string;
  }): void {
    try {
      this.setSentryUserContext({
        id: user.id,
        email: user.email,
        username: user.username,
        ip_address: user.ipAddress,
      });
    } catch (error) {
      this.logger.error('Failed to set user context in Sentry', error);
    }
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    try {
      Sentry.setUser(null);
    } catch (error) {
      this.logger.error('Failed to clear user context in Sentry', error);
    }
  }

  private isValidString(val: unknown): val is string {
    return typeof val === 'string' && val.length > 0;
  }

  private isValidObject(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
  }

  private isValidSuspiciousActivityData(data: unknown): data is SuspiciousActivityData {
    if (!this.isValidObject(data)) return false;
    const d = data as Partial<SuspiciousActivityData>;
    return (
      typeof d.activityType === 'string' &&
      typeof d.severity === 'string' &&
      d.timestamp instanceof Date
    );
  }

  private isValidAuthEventData(data: unknown): data is AuthEventData {
    if (!this.isValidObject(data)) return false;
    const d = data as Partial<AuthEventData>;
    return d.timestamp instanceof Date;
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);
    if (this.isValidObject(error) && typeof (error as { message?: unknown }).message === 'string') {
      return new Error((error as { message: string }).message);
    }
    return new Error('Unknown error');
  }

  private setSentryUserContext(user: {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
  }) {
    Sentry.setUser(user);
  }

  private mapSeverityToSentryLevel(severity: string): 'info' | 'warning' | 'error' | 'fatal' {
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
