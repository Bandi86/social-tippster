// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profileImage?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: User;
  authorId: string;
  category?: string;
  tags?: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked?: boolean;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  author: User;
  authorId: string;
  post: Post;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked?: boolean;
}

// Pagination types
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// Filter and sort types
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PostFilters extends BaseFilters {
  category?: string;
  tags?: string[];
  authorId?: string;
  isPublished?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserFilters extends BaseFilters {
  role?: 'user' | 'admin' | 'all';
  status?: 'active' | 'banned' | 'unverified' | 'all';
  isVerified?: boolean;
  isBanned?: boolean;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Admin specific types
export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  bannedUsers: number;
  unverifiedUsers: number;
  activeUsers: number;
  recentRegistrations: number;
  todayPosts: number;
  todayComments: number;
}

export interface UserAction {
  id: string;
  type: 'ban' | 'unban' | 'verify' | 'unverify' | 'role_change' | 'delete';
  targetUserId: string;
  targetUser: User;
  performedBy: User;
  performedById: string;
  reason?: string;
  createdAt: string;
}

export interface ModerationItem {
  id: string;
  type: 'post' | 'comment' | 'user';
  itemId: string;
  reportedBy: User;
  reportedById: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: User;
  resolvedById?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}
