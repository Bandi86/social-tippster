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

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  user_id: string;
  id: string; // Alias for user_id for compatibility
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string; // ISO format
  gender?: Gender;
  created_at: string;
  updated_at: string;
  favorite_team?: string;
  profile_image?: string;
  cover_image?: string;
  bio?: string;
  location?: string;
  website?: string;
  is_active: boolean;
  is_verified: boolean;
  is_banned: boolean;
  ban_reason?: string;
  banned_until?: string;
  last_login?: string;
  login_count: number;
  is_premium: boolean;
  premium_expiration?: string;
  referral_code?: string;
  referred_by?: string;
  referral_count: number;
  follower_count: number;
  following_count: number;
  post_count: number;
  reputation_score: number;
  badge_count: number;
  highest_badge_tier?: BadgeTier;
  total_tips: number;
  successful_tips: number;
  tip_success_rate: number;
  total_profit: number;
  current_streak: number;
  best_streak: number;
  email_verified_at?: string;
  two_factor_enabled: boolean;
  timezone?: string;
  language_preference: string;
  role: UserRole;
  created_by?: string;
  updated_by?: string;
}

// =============================================================================
// POST TYPES
export type PostCategory = 'tip' | 'discussion' | 'question' | 'news' | 'analysis';
export type SportType = 'football' | 'basketball' | 'tennis' | 'baseball' | 'other'; // bővíthető
export type PostStatus = 'active' | 'archived' | 'deleted' | 'pending_review';
export type PostVisibility = 'public' | 'private' | 'followers_only' | 'premium_only';

// =============================================================================
// LEGACY POST TYPES (for backward compatibility)
// =============================================================================

export interface LegacyPost {
  post_id: string;
  user_id: string;
  title?: string;
  content: string;
  summary?: string;
  category: PostCategory;
  subcategory?: string;
  sport_type?: SportType;
  match_id?: string;
  odds?: number;
  stake_amount?: number;
  potential_payout?: number;
  confidence_level?: number; // 1-10
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  is_published: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  status: PostStatus;
  visibility: PostVisibility;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  reading_time?: number;
  created_by?: string;
  updated_by?: string;
}

// =============================================================================

// =============================================================================
// COMMENT TYPES
export interface Comment {
  comment_id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  edit_count: number;
  like_count: number;
  dislike_count: number;
  reply_count: number;
  is_approved: boolean;
  is_flagged: boolean;
  flag_reason?: string;
}

// =============================================================================

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

// POSTS
export interface PostsResponse {
  posts: LegacyPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostData {
  title: string;
  content: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
}

export interface FetchPostsParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  author?: string;
  featured?: boolean;
}

// COMMENTS
export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCommentData {
  content: string;
  postId: string;
  parentCommentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface FetchCommentsParams {
  postId?: string;
  parentCommentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// USERS
export interface UserStats {
  posts: number;
  comments: number;
  likes: number;
  followers: number;
  following: number;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}
