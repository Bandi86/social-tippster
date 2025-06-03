// filepath: frontend/lib/security-api.ts
// ===============================
// Security API Service
// Handles all security-related API calls
// ===============================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LiveSecurityStatsData {
  currentActiveUsers: number;
  todaySuccessfulLogins: number;
  todayFailedLogins: number;
  last24HoursActivity: {
    successfulLogins: number;
    failedLogins: number;
    uniqueUsers: number;
  };
  realTimeStats: {
    last5MinutesLogins: number;
    last5MinutesFailures: number;
    averageSessionDuration: number;
  };
  suspiciousActivity: {
    multipleFailedAttemptsToday: number;
    unusualLocationLogins: number;
    rapidLoginAttempts: number;
  };
  topFailureReasons: Array<{
    reason: string;
    count: number;
  }>;
}

export interface UserSessionData {
  id: string;
  user_id: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
  session_token: string;
  device_type?: string;
  browser?: string;
  os?: string;
  location?: string;
  country?: string;
  city?: string;
  session_start: string;
  session_end?: string;
  is_active: boolean;
  last_activity?: string;
  activity_count?: number;
}

class SecurityApiService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Live Security Statistics
  async getLiveSecurityStats(): Promise<LiveSecurityStatsData> {
    return this.fetchWithAuth('/api/admin/analytics/live-login-stats');
  }

  // Session Management
  async getAllSessions(params?: { userId?: string; limit?: number }): Promise<UserSessionData[]> {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.fetchWithAuth(`/api/admin/analytics/sessions${query ? `?${query}` : ''}`);
  }

  async getUserSessions(userId: string): Promise<UserSessionData[]> {
    return this.fetchWithAuth(`/api/admin/analytics/sessions/${userId}`);
  }

  async terminateSession(sessionId: string): Promise<{ message: string }> {
    return this.fetchWithAuth(`/api/admin/analytics/sessions/${sessionId}/force-logout`, {
      method: 'POST',
    });
  }

  async terminateAllUserSessions(userId: string): Promise<{ message: string }> {
    return this.fetchWithAuth(`/api/admin/analytics/sessions/invalidate-all/${userId}`, {
      method: 'POST',
    });
  }

  // System Analytics
  async getSystemAnalytics(): Promise<any> {
    return this.fetchWithAuth('/api/admin/analytics/comprehensive');
  }

  async getUserStats(): Promise<any> {
    return this.fetchWithAuth('/api/admin/analytics/users');
  }

  async getPostStats(): Promise<any> {
    return this.fetchWithAuth('/api/admin/analytics/posts');
  }
}

export const securityApi = new SecurityApiService();
export default securityApi;
