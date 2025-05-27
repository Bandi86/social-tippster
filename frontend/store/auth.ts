import { AuthActions, AuthState, AuthTokens, User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      error: null,
      lastActivity: null,
      sessionExpiry: null,

      // Actions
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setAccessToken: (accessToken: string | null) => {
        const currentTokens = get().tokens;
        const tokens = accessToken ? { ...currentTokens, accessToken } : null;
        set({ tokens });
      },

      setTokens: (tokens: AuthTokens | null) => {
        set({ tokens, isAuthenticated: !!tokens?.accessToken });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      setInitialized: (isInitialized: boolean) => {
        set({ isInitialized });
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
          lastActivity: null,
          sessionExpiry: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateLastActivity: () => {
        set({ lastActivity: new Date().toISOString() });
      },

      // Updated API implementations
      login: async (credentials: any) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Enable sending/receiving cookies
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Login failed');
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }

          const data = await response.json();

          // Map backend response format to frontend format
          const tokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || null, // Handle case where refresh token might not be provided
            expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
            tokenType: 'Bearer' as const,
          };

          // Check if user data is nested or direct
          const backendUser = data.user || data;

          // Map backend user format to frontend format
          const user = {
            id: backendUser.user_id,
            email: backendUser.email,
            username: backendUser.username,
            first_name: backendUser.first_name,
            last_name: backendUser.last_name,
            role: backendUser.role,
            is_active: backendUser.is_active,
            is_banned: backendUser.is_banned || false,
            is_verified: backendUser.is_verified || false,
            created_at: backendUser.created_at,
            updated_at: backendUser.updated_at,
            profile_image: backendUser.profile_image,
            last_login: backendUser.last_login,
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date().toISOString(),
          });

          return data;
        } catch (error) {
          console.error('Login error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: any) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Enable sending/receiving cookies
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Registration failed');
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }

          const responseData = await response.json();

          set({
            user: responseData.user,
            tokens: responseData.tokens,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date().toISOString(),
          });

          return responseData;
        } catch (error) {
          console.error('Registration error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });

          const tokens = get().tokens;
          if (tokens?.accessToken) {
            try {
              await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                  'Content-Type': 'application/json',
                },
              });
            } catch (error) {
              console.warn('Logout API call failed:', error);
            }
          }

          get().clearAuth();
          set({ isLoading: false });
        } catch (error) {
          get().clearAuth();
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Logout failed',
          });
        }
      },

      refresh: async () => {
        try {
          const refreshToken = get().tokens?.refreshToken;
          if (!refreshToken) {
            return false;
          }

          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            get().clearAuth();
            return false;
          }

          const data = await response.json();

          set({
            tokens: data.tokens,
            lastActivity: new Date().toISOString(),
          });

          return true;
        } catch (error) {
          get().clearAuth();
          return false;
        }
      },
      resetPassword: async () => {},
      changePassword: async () => {},
      verifyEmail: async () => {},
      resendVerification: async () => {},
      initialize: async () => {
        set({ isLoading: true });
        try {
          const persistedTokens = get().tokens;
          const persistedUser = get().user;

          if (persistedTokens && persistedTokens.accessToken) {
            // If we have persisted user data, use it
            if (persistedUser) {
              set({
                user: persistedUser,
                tokens: persistedTokens,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
              });
              return;
            }

            // If no user data but we have tokens, fetch user data
            try {
              const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                  Authorization: `Bearer ${persistedTokens.accessToken}`,
                },
              });

              if (response.ok) {
                const userData = await response.json();
                set({
                  user: userData,
                  tokens: persistedTokens,
                  isAuthenticated: true,
                });
              } else {
                // Token is invalid, clear auth
                get().clearAuth();
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              get().clearAuth();
            }
          } else {
            // No persisted tokens
            console.log('Auth initialized, no persisted session.');
          }
        } catch (error) {
          console.error('Error during auth initialization:', error);
          get().clearAuth();
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },
      checkAuthStatus: async () => {
        // This could be a simpler check or part of initialize
        // For now, ensure it also handles isLoading if used independently
        set({ isLoading: true });
        try {
          // Your logic here
          const isAuthenticated = !!get().tokens?.accessToken; // Basic check
          set({ isAuthenticated });
          return isAuthenticated;
        } finally {
          set({ isLoading: false });
        }
      },
      refreshUserData: async () => {
        const tokens = get().tokens;
        if (!tokens?.accessToken) return;

        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            set({ user: userData });
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    },
  ),
);

// Convenience selectors
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthError = () => useAuthStore(state => state.error);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAccessToken = () => useAuthStore(state => state.tokens?.accessToken);
