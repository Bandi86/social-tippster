// ===============================
// Authentikáció store (Zustand)
// Ez a file tartalmazza az összes authentikációval kapcsolatos műveletet.
// Átlátható szekciók, magyar kommentek, könnyen bővíthető szerkezet.
// ===============================

// ---- Importok ----
import authService from '@/lib/auth-service';
import { AuthActions, AuthState, AuthTokens, User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---- API BASE URL ----
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ---- Interface-k ----
interface AuthStore extends AuthState, AuthActions {}

// ---- Store state ----
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
          const authResponse = await authService.login(credentials);
          set({
            user: authResponse.user,
            tokens: authResponse.tokens,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date().toISOString(),
          });
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
          const authResponse = await authService.register(data);
          set({
            user: authResponse.user,
            tokens: authResponse.tokens,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date().toISOString(),
          });
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
          await authService.logout();
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
          set({ isLoading: true });
          const refreshResponse = await authService.refreshToken();
          set({
            tokens: refreshResponse.tokens,
            lastActivity: new Date().toISOString(),
          });
          set({ isLoading: false });
          return true;
        } catch (error) {
          get().clearAuth();
          set({ isLoading: false });
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
