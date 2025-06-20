// ===============================
// Authentikáció store (Zustand)
// Ez a file tartalmazza az összes authentikációval kapcsolatos műveletet.
// Átlátható szekciók, magyar kommentek, könnyen bővíthető szerkezet.
// ===============================

// ---- Importok ----
import { completeAuthReset } from '@/lib/auth-reset';
import authService from '@/lib/auth-service';
import { AuthActions, AuthState, AuthTokens, RegisterData, User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---- API BASE URL ----
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
      // New session management fields
      sessionId: undefined,
      deviceFingerprint: undefined,
      idleTimeout: undefined,

      // Actions
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setAccessToken: (accessToken: string | null) => {
        const currentTokens = get().tokens;
        const tokens = accessToken ? { ...currentTokens, accessToken } : null;
        set({ tokens });

        // Sync with API client only
        if (typeof window !== 'undefined') {
          import('../lib/api-client').then(({ apiClient }) => {
            apiClient.setAccessToken(accessToken);
          });
          // Remove the separate localStorage 'authToken' storage
          // Token is now managed only through Zustand persistence
        }
      },

      setTokens: (tokens: AuthTokens | null) => {
        set({ tokens, isAuthenticated: !!tokens?.accessToken });

        // Sync with API client only
        if (typeof window !== 'undefined') {
          import('../lib/api-client').then(({ apiClient }) => {
            apiClient.setAccessToken(tokens?.accessToken || null);
          });
          // Remove the separate localStorage 'authToken' storage
          // Token is now managed only through Zustand persistence
        }
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
        console.log('🔄 Starting clearAuth...');

        // Always reset Zustand state in-memory first
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
          lastActivity: null,
          sessionExpiry: null,
          sessionId: undefined,
          deviceFingerprint: undefined,
          idleTimeout: undefined,
          isInitialized: false, // Force re-initialization
        });

        // Use comprehensive auth reset to clean any legacy localStorage entries
        if (typeof window !== 'undefined') {
          completeAuthReset();

          // Also clear API client auth
          import('../lib/api-client').then(({ apiClient }) => {
            apiClient.clearAuth();
          });
        }

        console.log('✅ clearAuth completed');
      },

      clearError: () => {
        set({ error: null });
      },

      updateLastActivity: () => {
        set({ lastActivity: new Date().toISOString() });
      },

      // New session management actions
      updateSessionActivity: () => {
        const now = new Date().toISOString();
        set({ lastActivity: now });

        // Update session expiry based on activity
        const current = get();
        if (current.idleTimeout) {
          const newExpiry = Date.now() + current.idleTimeout;
          set({ sessionExpiry: newExpiry });
        }
      },

      checkSessionExpiry: async () => {
        const current = get();
        if (!current.sessionExpiry) return true;

        const now = Date.now();
        if (now >= current.sessionExpiry) {
          console.log('Session expired, logging out...');
          await get().logout();
          return false;
        }
        return true;
      },

      extendSession: async () => {
        try {
          const refreshed = await get().refresh();
          if (refreshed) {
            console.log('Session extended successfully');
            get().updateSessionActivity();
          } else {
            console.log('Failed to extend session');
          }
        } catch (error) {
          console.error('Error extending session:', error);
        }
      },

      setSessionData: (sessionId?: string, fingerprint?: object, expiry?: number) => {
        set({
          sessionId,
          deviceFingerprint: fingerprint,
          sessionExpiry: expiry,
        });
      },

      // Updated API implementations
      login: async (credentials: any, clientFingerprint?: any) => {
        try {
          set({ isLoading: true, error: null });
          const authResponse = await authService.login(credentials, clientFingerprint);
          set({
            user: authResponse.user,
            tokens: authResponse.tokens,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date().toISOString(),
          });

          // Sync with API client only
          if (typeof window !== 'undefined') {
            import('../lib/api-client').then(({ apiClient }) => {
              apiClient.setAccessToken(authResponse.tokens.accessToken);
            });
            // Remove the separate localStorage 'authToken' storage
            // Token is now managed only through Zustand persistence
          }
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

      register: async (data: RegisterData, clientFingerprint?: object) => {
        try {
          set({ isLoading: true, error: null });
          const authResponse = await authService.register(data, clientFingerprint);
          console.log('Registration response:', authResponse);
          set({
            user: authResponse.user,
            tokens: authResponse.tokens,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date().toISOString(),
          });

          // Sync with API client only
          if (typeof window !== 'undefined') {
            import('../lib/api-client').then(({ apiClient }) => {
              apiClient.setAccessToken(authResponse.tokens.accessToken);
            });
            // Remove the separate localStorage 'authToken' storage
            // Token is now managed only through Zustand persistence
          }
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

          // Update session data with better integration
          set({
            tokens: refreshResponse.tokens,
            lastActivity: new Date().toISOString(),
            // Update session expiry if backend provides it
            sessionExpiry: refreshResponse.sessionExpiry || get().sessionExpiry,
          });

          // Sync with API client only
          if (typeof window !== 'undefined') {
            import('../lib/api-client').then(({ apiClient }) => {
              apiClient.setAccessToken(refreshResponse.tokens.accessToken);
            });
            // Remove the separate localStorage 'authToken' storage
            // Token is now managed only through Zustand persistence
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          get().clearAuth();

          // Clear API client token
          if (typeof window !== 'undefined') {
            import('../lib/api-client').then(({ apiClient }) => {
              apiClient.clearAuth();
            });
          }

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
          // First check if we have any persisted tokens or user data
          const persistedTokens = get().tokens;
          const persistedUser = get().user;

          // If no persisted data at all, set to guest state immediately
          if (!persistedTokens?.accessToken && !persistedUser) {
            console.log('No persisted auth data found, initializing as guest');
            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }

          // If we have persisted user data and a valid-looking token, try to use it
          if (persistedTokens?.accessToken && persistedUser) {
            console.log('Found persisted auth data, validating...');
            // Validate the token by trying to fetch user data
            try {
              const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                  Authorization: `Bearer ${persistedTokens.accessToken}`,
                },
              });

              if (response.ok) {
                const userData = await response.json();
                console.log('Token is valid, user authenticated');
                set({
                  user: userData,
                  tokens: persistedTokens,
                  isAuthenticated: true,
                  isLoading: false,
                  isInitialized: true,
                });
                return;
              } else {
                console.log('Token validation failed, clearing auth');
                get().clearAuth();
              }
            } catch (error) {
              console.error('Error validating token:', error);
              get().clearAuth();
            }
          } else if (persistedTokens?.accessToken && !persistedUser) {
            // If we only have tokens but no user data, fetch user data
            console.log('Found token but no user data, fetching user...');
            try {
              const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                  Authorization: `Bearer ${persistedTokens.accessToken}`,
                },
              });

              if (response.ok) {
                const userData = await response.json();
                console.log('User data fetched successfully');
                set({
                  user: userData,
                  tokens: persistedTokens,
                  isAuthenticated: true,
                  isLoading: false,
                  isInitialized: true,
                });
                return;
              } else {
                console.log('Failed to fetch user data, clearing auth');
                get().clearAuth();
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              get().clearAuth();
            }
          } else {
            // Invalid state, clear everything
            console.log('Invalid auth state detected, clearing');
            get().clearAuth();
          }
        } catch (error) {
          console.error('Error during auth initialization:', error);
          get().clearAuth();
        } finally {
          // Ensure we always set initialized to true and loading to false
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

      // Check if token needs rotation and automatically refresh it
      checkAndRotateToken: async () => {
        const tokens = get().tokens;
        if (!tokens?.accessToken) {
          return false;
        }

        try {
          // Decode the JWT to check expiry (client-side check)
          const base64Url = tokens.accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join(''),
          );

          const decoded = JSON.parse(jsonPayload);
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = decoded.exp - now;

          // If token expires in less than 5 minutes, refresh it
          if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
            console.log('Token near expiry, attempting automatic refresh...');
            const refreshed = await get().refresh();
            if (refreshed) {
              console.log('Token automatically refreshed');
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error('Error checking token expiry:', error);
          return false;
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
        sessionExpiry: state.sessionExpiry,
        sessionId: state.sessionId,
        deviceFingerprint: state.deviceFingerprint,
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
