import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';

export interface DeviceFingerprint {
  fingerprint_hash: string;
  user_agent: string;
  ip_address: string;
  device_type: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
  hardware_concurrency?: number;
  memory?: number;
  color_depth?: number;
  pixel_ratio?: number;
}

@Injectable()
export class DeviceFingerprintingService {
  /**
   * Generate comprehensive device fingerprint
   */
  generateDeviceFingerprint(
    request: Request,
    clientFingerprint?: Partial<DeviceFingerprint>,
  ): DeviceFingerprint {
    const userAgent = request.get('User-Agent') || '';
    const ip = this.extractIpAddress(request);

    // Server-side fingerprinting
    const serverFingerprint = {
      user_agent: userAgent,
      ip_address: ip,
      device_type: this.detectDeviceType(userAgent),
      browser: this.detectBrowser(userAgent),
      browser_version: this.detectBrowserVersion(userAgent),
      os: this.detectOS(userAgent),
      os_version: this.detectOSVersion(userAgent),
      platform: this.detectPlatform(userAgent),
    };

    // Merge with client-side fingerprint data
    const combinedFingerprint = {
      ...serverFingerprint,
      screen_resolution: clientFingerprint?.screen_resolution,
      timezone: clientFingerprint?.timezone || this.extractTimezone(request),
      language: clientFingerprint?.language || request.get('Accept-Language')?.split(',')[0],
      hardware_concurrency: clientFingerprint?.hardware_concurrency,
      memory: clientFingerprint?.memory,
      color_depth: clientFingerprint?.color_depth,
      pixel_ratio: clientFingerprint?.pixel_ratio,
    };

    // Generate unique hash
    const fingerprintString = JSON.stringify(combinedFingerprint);
    const fingerprint_hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');

    return {
      ...combinedFingerprint,
      fingerprint_hash,
    };
  }

  /**
   * Compare device fingerprints for suspicious activity detection
   */
  compareFingerprints(
    current: DeviceFingerprint,
    stored: DeviceFingerprint,
  ): {
    similarity_score: number;
    suspicious_changes: string[];
    is_suspicious: boolean;
  } {
    const suspiciousChanges: string[] = [];
    let matchCount = 0;
    let totalChecks = 0;

    // Critical fields that rarely change
    const criticalFields = [
      'device_type',
      'os',
      'screen_resolution',
      'hardware_concurrency',
      'timezone',
    ];

    // Check each field
    Object.keys(current).forEach(key => {
      if (key === 'fingerprint_hash' || key === 'ip_address') return;

      totalChecks++;

      if (current[key] === stored[key]) {
        matchCount++;
      } else if (criticalFields.includes(key)) {
        suspiciousChanges.push(`${key}: ${stored[key]} → ${current[key]}`);
      }
    });

    const similarity_score = totalChecks > 0 ? (matchCount / totalChecks) * 100 : 0;
    const is_suspicious = similarity_score < 70 || suspiciousChanges.length > 2;

    return {
      similarity_score,
      suspicious_changes: suspiciousChanges,
      is_suspicious,
    };
  }

  private extractIpAddress(request: Request): string {
    return (
      request.ip ||
      request.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      request.get('X-Real-IP') ||
      request.connection?.remoteAddress ||
      'unknown'
    );
  }

  private extractTimezone(request: Request): string | undefined {
    // Try to extract timezone from Accept-Language or other headers
    const acceptLanguage = request.get('Accept-Language');
    if (acceptLanguage) {
      // Basic timezone extraction logic
      return undefined; // Will be provided by client-side
    }
    return undefined;
  }

  private detectDeviceType(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Edg/')) return 'Edge';
    if (userAgent.includes('Chrome/')) return 'Chrome';
    if (userAgent.includes('Firefox/')) return 'Firefox';
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
    if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) return 'Opera';
    return 'Unknown';
  }

  private detectBrowserVersion(userAgent: string): string {
    const browser = this.detectBrowser(userAgent);
    let version = 'unknown';

    switch (browser) {
      case 'Chrome': {
        const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+)/);
        version = chromeMatch ? chromeMatch[1] : 'unknown';
        break;
      }
      case 'Firefox': {
        const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
        version = firefoxMatch ? firefoxMatch[1] : 'unknown';
        break;
      }
      case 'Safari': {
        const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
        version = safariMatch ? safariMatch[1] : 'unknown';
        break;
      }
      case 'Edge': {
        const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+)/);
        version = edgeMatch ? edgeMatch[1] : 'unknown';
        break;
      }
    }

    return version;
  }

  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows NT')) return 'Windows';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone OS')) return 'iOS';
    return 'Unknown';
  }

  private detectOSVersion(userAgent: string): string {
    const os = this.detectOS(userAgent);
    let version = 'unknown';

    switch (os) {
      case 'Windows': {
        const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
        version = windowsMatch ? windowsMatch[1] : 'unknown';
        break;
      }
      case 'macOS': {
        const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
        version = macMatch ? macMatch[1].replace(/_/g, '.') : 'unknown';
        break;
      }
      case 'Android': {
        const androidMatch = userAgent.match(/Android (\d+\.\d+)/);
        version = androidMatch ? androidMatch[1] : 'unknown';
        break;
      }
    }

    return version;
  }

  private detectPlatform(userAgent: string): string {
    if (userAgent.includes('Win64')) return 'Win64';
    if (userAgent.includes('Win32')) return 'Win32';
    if (userAgent.includes('Intel Mac')) return 'Intel Mac';
    if (userAgent.includes('PPC Mac')) return 'PPC Mac';
    if (userAgent.includes('X11')) return 'X11';
    return 'Unknown';
  }

  /**
   * Generate fallback fingerprint when request is not available
   */
  generateFallbackFingerprint(clientFingerprint?: Partial<DeviceFingerprint>): DeviceFingerprint {
    const fallbackData = {
      user_agent: 'unknown',
      ip_address: '127.0.0.1',
      device_type: 'unknown',
      browser: 'unknown',
      browser_version: 'unknown',
      os: 'unknown',
      os_version: 'unknown',
      platform: 'unknown',
      ...clientFingerprint,
    };

    const fingerprint_hash = this.generateFingerprintHash(fallbackData);

    return {
      ...fallbackData,
      fingerprint_hash,
    };
  }

  /**
   * Generate fingerprint hash from fingerprint data
   */
  private generateFingerprintHash(data: any): string {
    const fingerprintString = JSON.stringify(data);
    return crypto.createHash('sha256').update(fingerprintString).digest('hex');
  }
}
