// Posts API functions - migrating to Zustand stores
import axios from './axios';

// Types for posts
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  type: 'tip' | 'discussion' | 'news' | 'analysis';
  status: 'draft' | 'published' | 'archived' | 'hidden';
  author_id: string;
  author?: {
    user_id: string;
    username: string;
    profile_image?: string;
    reputation_score: number;
  };
  // Tip-specific fields
  odds?: number;
  stake?: number;
  confidence?: number;
  betting_market?: string;
  // Statistics
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  bookmarks_count: number;
  shares_count: number;
  // Features
  is_featured: boolean;
  is_premium: boolean;
  is_pinned: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  // User interactions (if authenticated)
  user_vote?: 'like' | 'dislike' | null;
  user_bookmarked?: boolean;
}

export interface UserPostsResponse {
  posts: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

/**
 * Fetch posts by username
 * @param username - The username to fetch posts for
 * @param page - Page number (default: 1)
 * @param limit - Number of posts per page (default: 10)
 * @returns User posts data
 */
export async function fetchUserPosts(
  username: string,
  page: number = 1,
  limit: number = 10,
): Promise<UserPostsResponse> {
  const url = `${API_BASE_URL}/posts/user/${username}?page=${page}&limit=${limit}`;
  return await axiosWithAuth({ url, method: 'GET' });
}

// Deprecated: This function is being migrated to Zustand stores
// Please use the corresponding hook instead:
// - usePosts().fetchUserPosts()
