/**
 * API Client for Social Platform
 * Handles HTTP requests with automatic token management and refresh
 */
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const databaseConfig = {
  databaseName: process.env.NEXT_PUBLIC_DATABASE_NAME || 'tippmix',
  // other database configs...
};

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      withCredentials: true, // Important for httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        // Remove manual Origin header - browser sets this automatically
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log('Making request to:', config.url, 'with token:', !!this.accessToken);

        // Add database name header if available
        if (!config.headers['X-Database-Name'] && databaseConfig.databaseName) {
          config.headers['X-Database-Name'] = databaseConfig.databaseName;
        }

        // Do not add Authorization header for refresh token requests
        if (config.url === '/auth/refresh') {
          console.log('Refresh request - not adding Authorization header');
          return config;
        }

        // Check and refresh token proactively before making the request
        if (this.accessToken && config.url !== '/auth/refresh') {
          await this.checkAndRefreshToken();
        }

        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          console.log('Added Authorization header');
        } else {
          console.log('No access token available');
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async error => {
        console.log('Response error:', error.response?.status, 'URL:', error.config?.url);

        const originalRequest = error.config;

        // Don't try to refresh if this IS the refresh request
        if (originalRequest.url === '/auth/refresh') {
          // If 404, treat as user not found and force logout
          if (error.response?.status === 404) {
            console.log('Refresh request 404 - user not found, clearing auth and logging out');
            this.clearAuth();
            // Only show toast if user was actually authenticated before this error
            if (typeof window !== 'undefined' && this.accessToken) {
              import('@/hooks/use-toast')
                .then(({ toast }) => {
                  toast({
                    title: 'Munkamenet lejárt',
                    description:
                      'A felhasználó nem található vagy a munkamenet lejárt. Kérlek jelentkezz be újra!',
                    variant: 'destructive',
                  });
                })
                .catch(() => {});
            }
          } else {
            console.log('Refresh request failed - clearing auth');
            this.clearAuth();
          }
          return Promise.reject(error);
        }

        if (
          (error.response?.status === 401 || error.response?.status === 404) &&
          !originalRequest._retry
        ) {
          // Only attempt token refresh if user actually has a token (i.e., was authenticated)
          if (!this.accessToken) {
            // Guest user encountering 401/404 - this is normal, don't show error messages
            console.log('Guest user 401/404 - no token to refresh, proceeding normally');
            return Promise.reject(error);
          }

          // 404 on any endpoint that means user/session not found, treat as logout
          if (
            error.response?.status === 404 &&
            originalRequest.url &&
            originalRequest.url.startsWith('/auth/refresh')
          ) {
            this.clearAuth();
            if (typeof window !== 'undefined') {
              import('@/hooks/use-toast')
                .then(({ toast }) => {
                  toast({
                    title: 'Munkamenet lejárt',
                    description:
                      'A felhasználó nem található vagy a munkamenet lejárt. Kérlek jelentkezz be újra!',
                    variant: 'destructive',
                  });
                })
                .catch(() => {});
            }
            return Promise.reject(error);
          }
          console.log('401/404 error - attempting token refresh');
          originalRequest._retry = true;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              console.log('Token refreshed successfully, retrying original request');
              // Retry the original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              }
              return this.client(originalRequest);
            } else {
              console.log('Token refresh failed');
            }
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Set access token for requests
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Refresh access token using httpOnly cookie
   */
  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.subscribeTokenRefresh(token => {
          resolve(!!token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      console.log('Attempting refresh token request...');
      console.log('Current cookies:', document.cookie);

      // Don't manually set Origin/Referer - browser handles these automatically
      const response = await this.client.post('/auth/refresh', {});

      const newToken = response.data.access_token;
      if (newToken) {
        console.log('New token received:', newToken.substring(0, 20) + '...');
        this.setAccessToken(newToken);
        this.onRefreshed(newToken);
        return true;
      }
      this.onRefreshed(null);
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      console.log('Error response:', (error as any).response?.data);
      this.onRefreshed(null);
      this.clearAuth();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  private onRefreshed(token: string | null): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private subscribeTokenRefresh(callback: (token: string | null) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * TEMPORARY: Set a test token for development
   */
  setTestToken(): void {
    // This simulates having a valid token
    this.setAccessToken('test-token-123');
    console.log('Test token set for development');
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    this.accessToken = null;
    // Also clear any test tokens
    console.log('Auth cleared');
  }

  /**
   * Make authenticated GET request
   */
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  /**
   * Make authenticated POST request
   */
  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  /**
   * Make authenticated PUT request
   */
  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  /**
   * Make authenticated DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  /**
   * Make authenticated PATCH request
   */
  async patch<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  /**
   * Check if token is near expiry and proactively refresh it
   */
  private async checkAndRefreshToken(): Promise<void> {
    if (!this.accessToken) {
      return;
    }

    try {
      // Decode JWT to check expiry
      const base64Url = this.accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );

      const decoded = JSON.parse(jsonPayload);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;

      // If token expires in less than 5 minutes, refresh it proactively
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
        console.log('Token near expiry, proactively refreshing...');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
