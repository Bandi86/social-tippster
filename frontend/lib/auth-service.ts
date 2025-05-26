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
function transformRegisterData(formData: RegisterFormData): any {
  return {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    first_name: formData.firstName,
    last_name: formData.lastName,
  };
}

// Transform login form data to backend API format
function transformLoginData(formData: LoginFormData): any {
  return {
    email: formData.email,
    password: formData.password,
  };
}

class AuthService {
  /**
   * Transform backend user to frontend user format
   */
  private transformUser(backendUser: BackendUser): User {
    return {
      id: backendUser.user_id,
      email: backendUser.email,
      username: backendUser.username,
      first_name: backendUser.first_name,
      last_name: backendUser.last_name,
      role: backendUser.role,
      is_active: backendUser.is_active,
      is_banned: backendUser.is_banned,
      is_verified: backendUser.is_verified,
      created_at: backendUser.created_at,
      updated_at: backendUser.updated_at,
      profile_image: backendUser.profile_image,
      last_login: backendUser.last_login,
    };
  }

  /**
   * User login
   */
  async login(formData: LoginFormData): Promise<AuthResponse> {
    try {
      const loginData = transformLoginData(formData);
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
  async register(formData: RegisterFormData): Promise<AuthResponse> {
    try {
      const registerData = transformRegisterData(formData);
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
