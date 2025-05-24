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
    const { confirmPassword, ...registerData } = userData;
    const response = await api.post<RegisterResponse>('/auth/register', registerData);
    return response.data;
  },

  /**
   * Get the current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
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
