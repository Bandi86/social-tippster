// User API functions - migrating to Zustand stores
import axios from './axios';

// Types for user profile
export interface UserProfile {
  user: {
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
    bio?: string;
    location?: string;
    website?: string;
    social_links?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
    is_active: boolean;
    is_verified: boolean;
    is_premium: boolean;
    created_at: string;
    updated_at: string;
  };
  stats: {
    posts_count: number;
    comments_count: number;
    likes_received: number;
    reputation_score: number;
    followers_count: number;
    following_count: number;
  };
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Helper to make authenticated axios requests
async function axiosWithAuth(config: any) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await axios({ ...config, headers });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Fetch user profile by username
 * @param username - The username to fetch profile for
 * @returns User profile data
 */
export async function fetchUserProfile(username: string): Promise<UserProfile> {
  const url = `${API_BASE_URL}/users/profile/${username}`;
  return await axiosWithAuth({ url, method: 'GET' });
}

/**
 * Update user profile
 * @param data - Profile data to update
 * @returns Updated user data
 */
export async function updateUserProfile(data: UpdateProfileData): Promise<any> {
  const url = `${API_BASE_URL}/users/me`;
  return await axiosWithAuth({ url, method: 'PUT', data });
}

/**
 * Change user password
 * @param data - Password change data
 */
export async function changeUserPassword(data: ChangePasswordData): Promise<void> {
  const url = `${API_BASE_URL}/users/change-password`;
  return await axiosWithAuth({
    url,
    method: 'PUT',
    data: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    },
  });
}

// Deprecated: These functions are being migrated to Zustand stores
// Please use the corresponding hooks instead:
// - useUsers().fetchUserProfile()
// - useUsers().updateProfile()
// - useUsers().changePassword()
