// =============================================================================
// FORM DATA TYPES
// =============================================================================

export type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
};

export type ResetPasswordFormData = {
  email: string;
};

export type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_banned: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_image?: string;
  last_login?: string;
}

export interface UserProfile extends Omit<User, 'is_banned' | 'role'> {
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// =============================================================================
// AUTHENTICATION TOKENS
// =============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string; // Optional since it's in httpOnly cookie
  expiresAt?: number;
  tokenType?: 'Bearer';
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// =============================================================================
// AUTHENTICATION STATE
// =============================================================================

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastActivity: string | null;
  sessionExpiry: number | null;
}

// =============================================================================
// REQUEST/RESPONSE INTERFACES
// =============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  // rememberMe?: boolean; // TODO: Add this when backend supports it
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
  user?: User; // In case user data needs to be updated
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// =============================================================================
// BACKEND TYPES (for API integration)
// =============================================================================

export interface BackendUser {
  user_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_banned: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_image?: string;
  last_login?: string;
  [key: string]: unknown;
}

export interface BackendAuthResponse {
  user: BackendUser;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  message?: string;
}

export interface BackendRefreshResponse {
  access_token: string;
  expires_in?: number;
  user?: BackendUser;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface AuthError {
  message: string;
  statusCode?: number;
  timestamp?: string;
  field?: string; // For field-specific validation errors
}

export interface BackendError {
  message: string;
  statusCode?: number;
  timestamp?: string;
  error?: string;
  details?: string | string[];
  field?: string;
  [key: string]: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// =============================================================================
// STORE ACTIONS & CONFIGURATION
// =============================================================================

export interface AuthActions {
  // Core authentication
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;

  // Password management
  resetPassword: (email: string) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;

  // Email verification
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;

  // State management
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  clearError: () => void;

  // Utility
  initialize: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  updateLastActivity: () => void;
}

export type AuthStore = AuthState & AuthActions;

// =============================================================================
// ROUTE PROTECTION
// =============================================================================

export interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export interface AdminGuardProps extends RouteGuardProps {
  requireAdmin?: boolean;
  allowedRoles?: UserRole[];
}

export interface RoleGuardProps extends RouteGuardProps {
  requiredRole: UserRole | UserRole[];
  operator?: 'AND' | 'OR';
}

// =============================================================================
// API CLIENT CONFIGURATION
// =============================================================================

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
      statusCode?: number;
      errors?: ValidationError[];
    };
    status?: number;
    statusText?: string;
  };
  request?: any;
  code?: string;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

// =============================================================================
// SESSION & SECURITY
// =============================================================================

export interface SessionConfig {
  maxInactivityTime: number; // in minutes
  warningTime: number; // in minutes before session expires
  refreshThreshold: number; // in minutes before token expires to refresh
}

export interface SecuritySettings {
  enforcePasswordPolicy: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type LoginMethod = 'email' | 'username' | 'phone';

export interface AuthEventPayload {
  type: 'login' | 'logout' | 'refresh' | 'error' | 'session_expired';
  timestamp: string;
  user?: User;
  error?: AuthError;
}

// =============================================================================
// TYPE GUARDS & UTILITIES
// =============================================================================

export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isAuthError = (error: any): error is AuthError => {
  return error && typeof error.message === 'string';
};

export const hasRole = (user: User | null, role: UserRole | UserRole[]): boolean => {
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};
