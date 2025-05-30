// frontend/store/users.ts
import axios from '@/lib/api/axios';
import { create } from 'zustand';
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

interface UsersState {
  currentUser: User | null;
  users: User[];
  userStats: UserStats | null;
  currentPage: number;
  totalUsers: number;
  hasMore: boolean;
  filters: {
    role?: string;
    status?: string;
    search?: string;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

interface UsersActions {
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  fetchUsers: (params?: FetchUsersParams) => Promise<void>;
  banUser: (id: string, reason: string) => Promise<void>;
  unbanUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, role: string) => Promise<void>;
  setFilters: (filters: Partial<UsersState['filters']>) => void;
  clearError: () => void;
}

export const useUsersStore = create<UsersState & UsersActions>((set, get) => ({
  currentUser: null,
  users: [],
  userStats: null,
  currentPage: 1,
  totalUsers: 0,
  hasMore: false,
  filters: {},
  isLoading: false,
  isSubmitting: false,
  error: null,

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
      set({ isSubmitting: false });
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
      set({ isSubmitting: false });
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
      set({ isSubmitting: false });
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false });
      throw error;
    }
  },

  setFilters(filters) {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },
  clearError() {
    set({ error: null });
  },
}));
