/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
import {
  AuthResponse,
  BackendAuthResponse,
  BackendRefreshResponse,
  BackendUser,
  ChangePasswordFormData,
  LoginFormData,
  RefreshTokenResponse,
  RegisterFormData,
  ResetPasswordFormData,
  User,
} from '@/types';
import apiClient from './api-client';

// Transform register form data to backend API format
function transformRegisterData(formData: RegisterFormData, clientFingerprint?: any): any {
  return {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    first_name: formData.firstName,
    last_name: formData.lastName,
    ...(clientFingerprint ? { clientFingerprint } : {}),
  };
}

// Transform login form data to backend API format
function transformLoginData(formData: LoginFormData, clientFingerprint?: any): any {
  return {
    email: formData.email,
    password: formData.password,
    ...(clientFingerprint ? { clientFingerprint } : {}),
  };
}

class AuthService {
  /**
   * Transform backend user to frontend user format
   */
  private transformUser(backendUser: BackendUser): User {
    return {
      badge_count: 0,
      ban_reason: undefined,
      banned_until: undefined,
      best_streak: 0,
      bio: typeof backendUser.bio === 'string' ? backendUser.bio : undefined,
      cover_image: undefined,
      created_at: backendUser.created_at,
      created_by: undefined,
      current_streak: 0,
      date_of_birth: undefined,
      email: backendUser.email,
      email_verified_at: undefined,
      favorite_team:
        typeof backendUser.favorite_team === 'string' ? backendUser.favorite_team : undefined,
      first_name: typeof backendUser.first_name === 'string' ? backendUser.first_name : undefined,
      follower_count:
        typeof backendUser.follower_count === 'number' ? backendUser.follower_count : 0,
      following_count:
        typeof backendUser.following_count === 'number' ? backendUser.following_count : 0,
      gender: undefined,
      highest_badge_tier: undefined,
      id: backendUser.user_id,
      is_active: backendUser.is_active,
      is_banned: backendUser.is_banned,
      is_premium: !!backendUser.is_premium,
      is_verified: backendUser.is_verified,
      language_preference: 'hu',
      last_login: backendUser.last_login,
      last_name: typeof backendUser.last_name === 'string' ? backendUser.last_name : undefined,
      login_count: typeof backendUser.login_count === 'number' ? backendUser.login_count : 0,
      location: typeof backendUser.location === 'string' ? backendUser.location : undefined,
      password_hash: typeof backendUser.password_hash === 'string' ? backendUser.password_hash : '',
      phone_number: typeof backendUser.phone === 'string' ? backendUser.phone : undefined,
      post_count: 0,
      premium_expiration: backendUser.premium_expiry
        ? typeof backendUser.premium_expiry === 'string'
          ? backendUser.premium_expiry
          : ((backendUser.premium_expiry as Date).toISOString?.() ?? undefined)
        : undefined,
      profile_image:
        typeof backendUser.profile_image === 'string' ? backendUser.profile_image : undefined,
      referred_by: undefined,
      referral_code: undefined,
      referral_count:
        typeof backendUser.referral_count === 'number' ? backendUser.referral_count : 0,
      reputation_score: 0,
      role: backendUser.role as 'user' | 'admin' | 'moderator',
      successful_tips: 0,
      tip_success_rate: 0,
      timezone: undefined,
      total_profit: 0,
      total_tips: 0,
      two_factor_enabled:
        typeof backendUser.two_factor_enabled === 'boolean'
          ? backendUser.two_factor_enabled
          : false,
      updated_at: backendUser.updated_at,
      updated_by: undefined,
      user_id: backendUser.user_id,
      username: backendUser.username,
      website: typeof backendUser.website === 'string' ? backendUser.website : undefined,
    };
  }

  /**
   * User login
   */
  async login(formData: LoginFormData, clientFingerprint?: any): Promise<AuthResponse> {
    try {
      const loginData = transformLoginData(formData, clientFingerprint);
      const response = await apiClient.post<BackendAuthResponse>('/auth/login', loginData);
      const authResponse: AuthResponse = {
        user: this.transformUser(response.data.user),
        tokens: {
          accessToken: response.data.access_token,
        },
        message: response.data.message,
      };
      return authResponse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(formData: RegisterFormData, clientFingerprint?: any): Promise<AuthResponse> {
    try {
      const registerData = transformRegisterData(formData, clientFingerprint);
      const response = await apiClient.post<BackendAuthResponse>('/auth/register', registerData);
      const authResponse: AuthResponse = {
        user: this.transformUser(response.data.user),
        tokens: {
          accessToken: response.data.access_token,
        },
        message: response.data.message,
      };
      return authResponse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed');
    }
  }

  /**
   * Refresh access token using httpOnly cookie
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await apiClient.post<BackendRefreshResponse>('/auth/refresh');

      return {
        tokens: {
          accessToken: response.data.access_token,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Logout user and clear refresh token
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error: unknown) {
      // Even if logout fails on server, we should clear local state
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Logout request failed:', errorMessage);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<BackendUser>('/users/me');
      return this.transformUser(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get current user');
    }
  }

  /**
   * Check if user is authenticated by trying to get current user
   */
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const user = await this.getCurrentUser();
      return { isAuthenticated: true, user };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordFormData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to change password');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ResetPasswordFormData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to request password reset');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password/confirm', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to reset password');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
