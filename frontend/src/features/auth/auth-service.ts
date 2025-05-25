import api from '@/lib/api/axios';
import { User } from '@/store/auth';
import { LoginFormValues, RegisterFormValues } from './schemas';

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Service for handling authentication operations
 */
export const AuthService = {
  /**
   * Login a user
   * @param credentials User credentials
   */
  login: async (credentials: LoginFormValues): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   * @param userData User registration data
   */
  register: async (userData: RegisterFormValues): Promise<RegisterResponse> => {
    // Extract only the needed fields and transform them
    const nameParts = userData.name.trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Generate a username from email (before @ symbol)
    const username = userData.email.split('@')[0];

    // Create the exact payload the backend expects
    const payload = {
      username,
      email: userData.email,
      password: userData.password,
      first_name,
      last_name,
    };

    const response = await api.post('/auth/register', payload);

    // Map backend response to frontend format
    const backendUser = response.data.user;
    const frontendUser: User = {
      id: backendUser.user_id,
      email: backendUser.email,
     username:
        `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() ||
        backendUser.username,
      role: backendUser.role || 'user',
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at,
    };

    return {
      user: frontendUser,
      accessToken: response.data.accessToken,
    };
  },

  /**
   * Get the current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    const backendUser = response.data;

    // Map backend response to frontend format
    return {
      id: backendUser.user_id,
      email: backendUser.email,
      username:
        `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() ||
        backendUser.username,
      role: backendUser.role || 'user',
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at,
    };
  },

  /**
   * Refresh the access token using the refresh token cookie
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
