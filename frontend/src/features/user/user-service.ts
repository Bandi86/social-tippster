import api from '@/lib/api/axios';
import { User } from '@/store/auth';

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Service for handling user operations
 */
export const UserService = {
  /**
   * Get user profile
   */
  getUserProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>('/users/me', userData);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData: ChangePasswordDto): Promise<void> => {
    await api.post('/users/change-password', passwordData);
  },
};
