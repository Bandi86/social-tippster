// User-facing Users API for profile management and user interactions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// User interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  is_active: boolean;
  is_banned: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_image?: string;
  last_login?: string;
  bio?: string;
  location?: string;
  website?: string;
  following_count?: number;
  followers_count?: number;
  posts_count?: number;
  tips_count?: number;
  success_rate?: number;
  total_profit?: number;
  is_following?: boolean; // If the current user is following this user
}

export interface UserProfile {
  user: User;
  stats: {
    posts_count: number;
    tips_count: number;
    followers_count: number;
    following_count: number;
    success_rate: number;
    total_profit: number;
  };
  recent_posts?: any[];
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get auth token from localStorage or cookie
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try localStorage first
  const token = localStorage.getItem('authToken');
  if (token) return token;

  // Fallback to cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'authToken') {
      return value;
    }
  }

  return null;
}

// Helper to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// === PUBLIC USER ENDPOINTS ===

// Get user by ID (public)
export async function fetchUserById(id: string): Promise<User> {
  const url = `${API_BASE_URL}/users/${id}`;
  return fetchWithAuth(url);
}

// Get user by username (public)
export async function fetchUserByUsername(username: string): Promise<User> {
  const url = `${API_BASE_URL}/users/username/${username}`;
  return fetchWithAuth(url);
}

// Get user profile with stats (public)
export async function fetchUserProfile(username: string): Promise<UserProfile> {
  const user = await fetchUserByUsername(username);

  // For now, we'll use mock stats - in a real implementation, this would be a dedicated endpoint
  const stats = {
    posts_count: 0,
    tips_count: 0,
    followers_count: 0,
    following_count: 0,
    success_rate: 0,
    total_profit: 0,
  };

  return {
    user,
    stats,
  };
}

// Get list of users (public, with pagination)
export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);

  const url = `${API_BASE_URL}/users?${searchParams.toString()}`;
  return fetchWithAuth(url);
}

// === AUTHENTICATED USER ENDPOINTS ===

// Get current user profile (authenticated)
export async function fetchCurrentUser(): Promise<User> {
  const url = `${API_BASE_URL}/users/me`;
  return fetchWithAuth(url);
}

// Update current user profile (authenticated)
export async function updateCurrentUser(data: UpdateUserData): Promise<User> {
  const currentUser = await fetchCurrentUser();
  const url = `${API_BASE_URL}/users/${currentUser.id}`;
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Change password (authenticated)
export async function changePassword(data: ChangePasswordData): Promise<void> {
  const currentUser = await fetchCurrentUser();
  const url = `${API_BASE_URL}/users/${currentUser.id}/change-password`;

  // Transform data to match backend expectations
  const requestData = {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  };

  await fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(requestData),
  });
}

// Delete current user account (authenticated)
export async function deleteCurrentUser(): Promise<void> {
  const currentUser = await fetchCurrentUser();
  const url = `${API_BASE_URL}/users/${currentUser.id}`;
  await fetchWithAuth(url, {
    method: 'DELETE',
  });
}

// === SOCIAL FEATURES ===

// Follow user (authenticated)
export async function followUser(userId: string): Promise<void> {
  const url = `${API_BASE_URL}/users/${userId}/follow`;
  await fetchWithAuth(url, {
    method: 'PATCH',
  });
}

// Unfollow user (authenticated)
export async function unfollowUser(userId: string): Promise<void> {
  const url = `${API_BASE_URL}/users/${userId}/unfollow`;
  await fetchWithAuth(url, {
    method: 'PATCH',
  });
}

// Get user's followers
export async function fetchUserFollowers(
  userId: string,
  page: number = 1,
  limit: number = 20,
): Promise<UsersResponse> {
  const url = `${API_BASE_URL}/users/${userId}/followers?page=${page}&limit=${limit}`;
  return fetchWithAuth(url);
}

// Get users that user is following
export async function fetchUserFollowing(
  userId: string,
  page: number = 1,
  limit: number = 20,
): Promise<UsersResponse> {
  const url = `${API_BASE_URL}/users/${userId}/following?page=${page}&limit=${limit}`;
  return fetchWithAuth(url);
}

// === UTILITY FUNCTIONS ===

// Check if current user can edit a user profile
export function canEditUser(targetUser: User, currentUser?: User | null): boolean {
  if (!currentUser) return false;

  // Users can edit their own profile
  if (currentUser.id === targetUser.id) return true;

  // Admins can edit any profile
  if (currentUser.role === 'ADMIN') return true;

  return false;
}

// Function aliases for backward compatibility
export const updateUserProfile = updateCurrentUser;
export const changeUserPassword = changePassword;

// Get display name for user
export function getDisplayName(user: User): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username;
}

// Get user avatar URL with fallback
export function getUserAvatarUrl(user: User): string {
  if (user.profile_image) {
    return user.profile_image;
  }

  // Generate a simple avatar using the user's initials
  const displayName = getDisplayName(user);
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Use a service like UI Avatars for generated avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=128`;
}

// Format user join date
export function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}
