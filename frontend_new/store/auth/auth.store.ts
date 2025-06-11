// ===============================
// Authentikáció store (Zustand)
// Ez a file tartalmazza az összes authentikációval kapcsolatos műveletet.
// Átlátható szekciók, magyar kommentek, könnyen bővíthető szerkezet.
// ===============================

// IMPORTOK
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---- API BASE URL ----
// TODO: Switch back to API Gateway once proxy forwarding is fixed
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001/api';

// ---- TYPES ----
export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  isOnline?: boolean;
  lastOnlineAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
  timestamp?: string;
}

// ---- STORE STATE INTERFACE ----
interface AuthState {
  // State
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  lastActivity: number;
  sessionExpiration: number | null;
  deviceFingerprint: string | null;
  idleTimeout: number;
  accessToken: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateActivity: () => void;
  clearError: () => void;
  checkSession: () => Promise<boolean>;
  generateDeviceFingerprint: () => string;
  resetStore: () => void;
}

// ---- UTILITY FUNCTIONS ----
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 0,
    navigator.platform,
  ].join('|');

  return btoa(fingerprint).substring(0, 32);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    credentials: 'include', // Important for HttpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

// ---- STORE ----
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // INITIAL STATE
      user: null,
      sessionId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: Date.now(),
      sessionExpiration: null,
      deviceFingerprint: null,
      idleTimeout: 15 * 60 * 1000, // 15 minutes
      accessToken: null,

      // ---- ACTIONS ----

      /**
       * User login with session management
       */
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const deviceFingerprint = generateDeviceFingerprint();

          const response = await makeRequest<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              ...credentials,
              deviceFingerprint,
            }),
          });

          const now = Date.now();

          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: now,
            sessionExpiration: now + get().idleTimeout,
            deviceFingerprint,
          });

          console.log('✅ Login successful:', response.user.username);
        } catch (error) {
          console.error('❌ Login failed:', error);
          set({
            isLoading: false,
            error: {
              message: error instanceof Error ? error.message : 'Login failed',
              timestamp: new Date().toISOString(),
            },
          });
          throw error;
        }
      },

      /**
       * User registration
       */
      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await makeRequest<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });

          console.log('✅ Registration successful:', response.message);
          set({ isLoading: false, error: null });
        } catch (error) {
          console.error('❌ Registration failed:', error);
          set({
            isLoading: false,
            error: {
              message: error instanceof Error ? error.message : 'Registration failed',
              timestamp: new Date().toISOString(),
            },
          });
          throw error;
        }
      },

      /**
       * User logout with session cleanup
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          await makeRequest<void>('/auth/logout', {
            method: 'POST',
          });

          console.log('✅ Logout successful');
        } catch (error) {
          console.warn('⚠️ Logout request failed, cleaning local state anyway:', error);
        } finally {
          // Always clear local state regardless of API response
          set({
            user: null,
            sessionId: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            sessionExpiration: null,
            deviceFingerprint: null,
            lastActivity: Date.now(),
          });
        }
      },

      /**
       * Refresh access token using HttpOnly cookie
       */
      refreshToken: async () => {
        try {
          const response = await makeRequest<AuthResponse>('/auth/refresh', {
            method: 'POST',
          });

          const now = Date.now();

          set({
            accessToken: response.accessToken,
            lastActivity: now,
            sessionExpiration: now + get().idleTimeout,
            error: null,
          });

          console.log('✅ Token refreshed successfully');
        } catch (error) {
          console.error('❌ Token refresh failed:', error);

          // If refresh fails, logout user
          set({
            user: null,
            sessionId: null,
            accessToken: null,
            isAuthenticated: false,
            error: {
              message: 'Session expired, please login again',
              timestamp: new Date().toISOString(),
            },
          });

          throw error;
        }
      },

      /**
       * Update user activity timestamp
       */
      updateActivity: () => {
        const now = Date.now();
        set({
          lastActivity: now,
          sessionExpiration: now + get().idleTimeout,
        });
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Check if current session is valid
       */
      checkSession: async (): Promise<boolean> => {
        const { isAuthenticated, sessionExpiration } = get();

        if (!isAuthenticated) {
          return false;
        }

        // Check if session is expired
        if (sessionExpiration && Date.now() > sessionExpiration) {
          console.log('⏰ Session expired, attempting refresh...');
          try {
            await get().refreshToken();
            return true;
          } catch {
            return false;
          }
        }

        return true;
      },

      /**
       * Generate device fingerprint
       */
      generateDeviceFingerprint: () => {
        const fingerprint = generateDeviceFingerprint();
        set({ deviceFingerprint: fingerprint });
        return fingerprint;
      },

      /**
       * Reset store to initial state
       */
      resetStore: () => {
        set({
          user: null,
          sessionId: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          lastActivity: Date.now(),
          sessionExpiration: null,
          deviceFingerprint: null,
        });
      },
    }),
    {
      name: 'auth-store',
      // Only persist safe data, not sensitive tokens
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        deviceFingerprint: state.deviceFingerprint,
        idleTimeout: state.idleTimeout,
        lastActivity: state.lastActivity,
      }),
    },
  ),
);
