Collecting workspace information# Authentication System Analysis and Solution

Looking at your admin panel authentication issue, I've identified the key problem: the admin users API service doesn't have access to the authentication token from your auth store. Let's fix this properly.

## Current Issues

1. The `AdminUsersAPI` is trying to extract a token from request headers that doesn't exist
2. There's no mechanism to inject the token from your auth store into the request
3. The current error "Authorization token is required" happens because no token is found

## Solution: Authentication Request Wrapper

I recommend creating a proper authentication wrapper that:
- Uses your existing Zustand auth store
- Automatically adds tokens to requests
- Handles token refresh
- Provides consistent error handling

Here's how to implement it:

### 1. First, create a new authentication client wrapper

```typescript
import { useAuthStore } from '@/store/auth';
import { AuthService } from '@/features/auth/auth-service';

export class AuthClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = useAuthStore.getState().accessToken;

    // Add auth token to request headers
    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - could be expired token
      if (response.status === 401) {
        // Try to refresh the token
        try {
          const refreshResult = await AuthService.refreshToken();
          if (refreshResult.accessToken) {
            // Update token in store
            useAuthStore.getState().setAccessToken(refreshResult.accessToken);

            // Retry the original request with new token
            return this.request(endpoint, options);
          }
        } catch (refreshError) {
          // Token refresh failed, user needs to login again
          useAuthStore.getState().logout();
          throw new Error('Your session has expired. Please login again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      // Re-throw with more context if needed
      throw error;
    }
  }
}

export const authClient = new AuthClient();
```

### 2. Update your auth store to include the access token

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null; // Add access token storage
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAccessToken: (token: string | null) => void; // Add setter
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      accessToken: null, // Store token in memory
      setUser: user => set({ user }),
      setAuthenticated: isAuthenticated => set({ isAuthenticated }),
      setAccessToken: accessToken => set({ accessToken }),
      logout: () => set({ user: null, isAuthenticated: false, accessToken: null }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
```

### 3. Update your auth service to store the token

```typescript
import api from '@/lib/api/axios';
import { User, useAuthStore } from '@/store/auth';
import { LoginFormValues, RegisterFormValues } from './schemas';

/**
 * Service for handling authentication operations
 */
export const AuthService = {
  /**
   * Login a user
   * @param credentials User credentials
   */
  login: async (credentials: LoginFormValues): Promise<{ user: User }> => {
    const response = await api.post<{ accessToken: string, user: any }>('/auth/login', credentials);

    // Store the token in the auth store
    useAuthStore.getState().setAccessToken(response.data.accessToken);

    // Map backend user to frontend user format
    const mappedUser = {
      id: response.data.user.user_id,
      email: response.data.user.email,
      username: response.data.user.username,
      role: response.data.user.role,
      createdAt: response.data.user.created_at,
      updatedAt: response.data.user.updated_at,
    };

    return { user: mappedUser };
  },

  // Similar updates for other methods...

  /**
   * Refresh the access token using the refresh token cookie
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await api.post<{ access_token: string }>('/auth/refresh');
    return { accessToken: response.data.access_token };
  },
};
```

### 4. Update your AdminUsersAPI to use the new auth client

```typescript
import { ApiResponse, User, UserFilters } from '@/types';
import { authClient } from './auth-client';

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class AdminUsersAPI {
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

    return authClient.request<PaginatedUsers>(endpoint);
  }

  // Get single user by ID
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return authClient.request<User>(`/admin/users/${userId}`);
  }

  // Ban user
  async banUser(userId: string, reason?: string): Promise<ApiResponse<User>> {
    return authClient.request<User>(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // All other methods updated to use authClient.request...
}

export const adminUsersAPI = new AdminUsersAPI();
```

### 5. Update your hooks to use the updated store

```typescript
import { AuthService } from '@/features/auth/auth-service';
import { useAuthStore } from '@/store/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useAuth = (options: { skipInitialization?: boolean } = {}) => {
  const { user, isAuthenticated, accessToken, setUser, setAuthenticated, setAccessToken, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(options.skipInitialization || false);
  const [isLoading, setIsLoading] = useState(!options.skipInitialization);
  const initializationRef = useRef(false);
  const queryClient = useQueryClient();

  // Memoize the logout function to prevent unnecessary re-renders
  const memoizedLogout = useCallback(async () => {
    try {
      await AuthService.logout();
      setAuthenticated(false);
      setUser(null);
      setAccessToken(null);
      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [setAuthenticated, setUser, setAccessToken, queryClient]);

  // Rest of your hook implementation...

  return {
    user,
    isAuthenticated,
    accessToken,
    isLoading: finalIsLoading,
    logout: memoizedLogout,
  };
};
```

## Benefits of This Approach

1. **Centralized Auth Management**: Token stored in one place (Zustand store)
2. **Automatic Token Handling**: All API requests automatically include the token
3. **Token Refresh**: Handles expired tokens with automatic refresh
4. **Clean Error Handling**: Better user experience with clear error messages
5. **No Local Storage**: Tokens kept in memory for better security
6. **Consistency**: All API calls use the same authentication mechanism

This solution provides a more robust authentication system while maintaining a good user experience. The token is automatically added to requests, and token refresh is handled transparently, so users don't need to log in again when their token expires.

Let me know if you need any clarification or have questions about implementing this solution!
