// Admin API service for user management
import { useAuthStore } from '@/store/auth';
import { ApiResponse, User, UserFilters } from '@/types';

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class AdminUsersAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Get the access token from the auth store
    const accessToken = useAuthStore.getState().accessToken;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      credentials: 'include', // Important for sending/receiving cookies with requests
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  // Get paginated users with filters
  async getUsers(filters: UserFilters = {}): Promise<ApiResponse<PaginatedUsers>> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedUsers>(endpoint);
  }

  // Get single user by ID
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}`);
  }

  // Ban user
  async banUser(userId: string, reason?: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Unban user
  async unbanUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}/unban`, {
      method: 'POST',
    });
  }

  // Verify user
  async verifyUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}/verify`, {
      method: 'POST',
    });
  }

  // Unverify user
  async unverifyUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}/unverify`, {
      method: 'POST',
    });
  }

  // Change user role
  async changeUserRole(userId: string, role: 'user' | 'admin'): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // Delete user
  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Get user statistics
  async getUserStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      banned: number;
      unverified: number;
      admins: number;
      recentRegistrations: number;
    }>
  > {
    return this.request('/admin/users/stats');
  }
}

export const adminUsersAPI = new AdminUsersAPI();
