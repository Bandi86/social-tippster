// Enhanced users store with admin functionality
import axios from '@/lib/api/axios';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChangePasswordData, FetchUsersParams, UpdateProfileData, User, UserStats } from '../types';

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

// Admin-specific interfaces
export interface AdminUser extends User {
  // Admin-only fields
  password_hash?: string;
  login_count: number;
  last_login?: string;
  ban_reason?: string;
  banned_until?: string;
  created_by?: string;
  updated_by?: string;
}

export interface AdminUserStats {
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
  premium: number;
  verified: number;
  moderators: number;
}

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  banned?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  is_premium?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'last_login' | 'reputation_score' | 'username';
  sortOrder?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Enhanced state interface with admin functionality
interface UsersState {
  // Regular user-facing data
  currentUser: User | null;
  users: User[];
  userStats: UserStats | null;

  // Admin-specific data
  adminUsers: AdminUser[];
  adminUserStats: AdminUserStats | null;

  // Pagination and filtering
  currentPage: number;
  totalUsers: number;
  hasMore: boolean;
  filters: {
    role?: string;
    status?: string;
    search?: string;
  };

  // Admin pagination and filtering
  adminPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  adminFilters: AdminUsersParams;

  // Admin UI state
  selectedUserIds: string[];

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Admin loading states
  isLoadingAdminUsers: boolean;
  isLoadingAdminStats: boolean;
}

// Enhanced actions interface with admin functionality
interface UsersActions {
  // Regular user actions
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  fetchUsers: (params?: FetchUsersParams) => Promise<void>;

  // Basic admin actions (existing)
  banUser: (id: string, reason: string) => Promise<void>;
  unbanUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, role: string) => Promise<void>;

  // Enhanced admin actions
  fetchAdminUsers: (params?: AdminUsersParams) => Promise<void>;
  fetchAdminUserStats: () => Promise<void>;
  fetchAdminUserById: (id: string) => Promise<AdminUser>;
  verifyUserEmail: (id: string) => Promise<void>;
  revokeUserEmailVerification: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  bulkBanUsers: (ids: string[], reason: string) => Promise<void>;
  bulkUnbanUsers: (ids: string[]) => Promise<void>;
  bulkDeleteUsers: (ids: string[]) => Promise<void>;
  bulkUpdateUserRole: (ids: string[], role: string) => Promise<void>;

  // Admin UI Management
  setAdminFilters: (filters: Partial<AdminUsersParams>) => void;
  setAdminPage: (page: number) => void;
  toggleUserSelection: (id: string) => void;
  selectAllUsers: () => void;
  clearUserSelection: () => void;

  // Regular UI management
  setFilters: (filters: Partial<UsersState['filters']>) => void;
  clearError: () => void;
}

export const useUsersStore = create<UsersState & UsersActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentUser: null,
      users: [],
      userStats: null,
      adminUsers: [],
      adminUserStats: null,
      currentPage: 1,
      totalUsers: 0,
      hasMore: false,
      filters: {},
      adminPagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      adminFilters: {},
      selectedUserIds: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
      isLoadingAdminUsers: false,
      isLoadingAdminStats: false,

      // Regular user actions
      async updateProfile(data) {
        set({ isSubmitting: true, error: null });
        try {
          const url = `${API_BASE_URL}/users/me`;
          const user = await axiosWithAuth({ url, method: 'PUT', data });
          set({ currentUser: user, isSubmitting: false });
          return user;
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async changePassword(data) {
        set({ isSubmitting: true, error: null });
        try {
          const url = `${API_BASE_URL}/users/me/change-password`;
          await axiosWithAuth({ url, method: 'PATCH', data });
          set({ isSubmitting: false });
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async fetchUsers(params) {
        set({ isLoading: true, error: null });
        try {
          const searchParams = new URLSearchParams();
          if (params?.page) searchParams.append('page', params.page.toString());
          if (params?.limit) searchParams.append('limit', params.limit.toString());
          if (params?.search) searchParams.append('search', params.search);
          if (params?.role) searchParams.append('role', params.role);
          if (params?.status) searchParams.append('status', params.status);

          const url = `${API_BASE_URL}/users?${searchParams.toString()}`;
          const data = await axiosWithAuth({ url, method: 'GET' });

          set({
            users: data.users,
            currentPage: data.page,
            totalUsers: data.total,
            hasMore: data.page < data.totalPages,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      async banUser(id, reason) {
        set({ isSubmitting: true, error: null });
        try {
          const url = `${API_BASE_URL}/users/${id}/ban`;
          await axiosWithAuth({ url, method: 'PATCH', data: { reason } });

          // Update admin users list if present
          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              user.id === id
                ? { ...user, is_banned: true, ban_reason: reason, banned_until: undefined }
                : user,
            ),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async unbanUser(id) {
        set({ isSubmitting: true, error: null });
        try {
          const url = `${API_BASE_URL}/users/${id}/unban`;
          await axiosWithAuth({ url, method: 'PATCH' });

          // Update admin users list if present
          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              user.id === id
                ? { ...user, is_banned: false, ban_reason: undefined, banned_until: undefined }
                : user,
            ),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async changeUserRole(id, role) {
        set({ isSubmitting: true, error: null });
        try {
          const url = `${API_BASE_URL}/users/${id}/role`;
          await axiosWithAuth({ url, method: 'PATCH', data: { role } });

          // Update admin users list if present
          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              user.id === id ? { ...user, role: role as any } : user,
            ),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      // Enhanced admin actions
      async fetchAdminUsers(params = {}) {
        set({ isLoadingAdminUsers: true, error: null });
        try {
          const { adminFilters, adminPagination } = get();
          const finalParams = {
            ...adminFilters,
            ...params,
            page: params.page || adminPagination.page,
            limit: params.limit || adminPagination.limit,
          };

          // Mock API call - in production this would be a real API call
          await new Promise(resolve => setTimeout(resolve, 500));

          // Mock response - in production, replace with real API call
          const mockAdminUsers: AdminUser[] = [
            {
              id: '1',
              user_id: '1',
              username: 'john_doe',
              email: 'john.doe@example.com',
              password_hash: 'hashed_password',
              first_name: 'John',
              last_name: 'Doe',
              role: 'user',
              is_active: true,
              is_verified: true,
              is_banned: false,
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-15T10:30:00Z',
              login_count: 45,
              reputation_score: 850,
              follower_count: 12,
              following_count: 25,
              post_count: 8,
              badge_count: 3,
              total_tips: 15,
              successful_tips: 12,
              tip_success_rate: 80,
              total_profit: 250.5,
              current_streak: 3,
              best_streak: 8,
              two_factor_enabled: false,
              language_preference: 'en',
              is_premium: false,
              referral_count: 2,
              last_login: '2024-01-20T14:30:00Z',
            },
            // Add more mock users as needed
          ];

          const response: AdminUsersResponse = {
            users: mockAdminUsers,
            meta: {
              total: mockAdminUsers.length,
              page: finalParams.page || 1,
              limit: finalParams.limit || 20,
              totalPages: Math.ceil(mockAdminUsers.length / (finalParams.limit || 20)),
            },
          };

          set({
            adminUsers: response.users,
            adminPagination: response.meta,
            adminFilters: finalParams,
            isLoadingAdminUsers: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoadingAdminUsers: false });
        }
      },

      async fetchAdminUserStats() {
        set({ isLoadingAdminStats: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 300));

          const mockStats: AdminUserStats = {
            total: 1250,
            active: 1180,
            banned: 25,
            unverified: 45,
            admins: 3,
            moderators: 8,
            premium: 120,
            verified: 1205,
            recentRegistrations: 89,
          };

          set({ adminUserStats: mockStats, isLoadingAdminStats: false });
        } catch (error: any) {
          set({ error: error.message, isLoadingAdminStats: false });
        }
      },

      async fetchAdminUserById(id) {
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 200));

          const { adminUsers } = get();
          const user = adminUsers.find(u => u.id === id);
          if (!user) {
            throw new Error('User not found');
          }
          return user;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      async verifyUserEmail(id) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              user.id === id
                ? { ...user, is_verified: true, email_verified_at: new Date().toISOString() }
                : user,
            ),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async revokeUserEmailVerification(id) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              user.id === id ? { ...user, is_verified: false, email_verified_at: undefined } : user,
            ),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async deleteUser(id) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            adminUsers: state.adminUsers.filter(user => user.id !== id),
            selectedUserIds: state.selectedUserIds.filter(selectedId => selectedId !== id),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async bulkBanUsers(ids, reason) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              ids.includes(user.id)
                ? { ...user, is_banned: true, ban_reason: reason, banned_until: undefined }
                : user,
            ),
            selectedUserIds: [],
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async bulkUnbanUsers(ids) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              ids.includes(user.id)
                ? { ...user, is_banned: false, ban_reason: undefined, banned_until: undefined }
                : user,
            ),
            selectedUserIds: [],
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async bulkDeleteUsers(ids) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            adminUsers: state.adminUsers.filter(user => !ids.includes(user.id)),
            selectedUserIds: [],
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async bulkUpdateUserRole(ids, role) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            adminUsers: state.adminUsers.map(user =>
              ids.includes(user.id) ? { ...user, role: role as any } : user,
            ),
            selectedUserIds: [],
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      // Admin UI Management
      setAdminFilters(filters) {
        set(state => ({
          adminFilters: { ...state.adminFilters, ...filters },
          adminPagination: { ...state.adminPagination, page: 1 }, // Reset to first page
        }));
      },

      setAdminPage(page) {
        set(state => ({
          adminPagination: { ...state.adminPagination, page },
        }));
      },

      toggleUserSelection(id) {
        set(state => ({
          selectedUserIds: state.selectedUserIds.includes(id)
            ? state.selectedUserIds.filter(selectedId => selectedId !== id)
            : [...state.selectedUserIds, id],
        }));
      },

      selectAllUsers() {
        set(state => ({
          selectedUserIds: state.adminUsers.map(user => user.id),
        }));
      },

      clearUserSelection() {
        set({ selectedUserIds: [] });
      },

      // Regular UI management
      setFilters(filters) {
        set(state => ({ filters: { ...state.filters, ...filters } }));
      },

      clearError() {
        set({ error: null });
      },
    }),
    { name: 'users-store' },
  ),
);
