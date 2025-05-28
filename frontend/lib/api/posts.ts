// User-facing Posts API (separate from admin API)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  type: 'tip' | 'discussion' | 'news' | 'analysis';
  // Tip-specific optional fields
  odds?: number;
  stake?: number;
  confidence?: number;
  betting_market?: string;
  // Content options
  is_premium?: boolean;
  tags?: string[];
}

// Get auth token from localStorage or cookie
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Helper to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get all posts (public, with pagination and filtering)
export async function fetchPosts(params?: {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  author?: string;
  featured?: boolean;
}): Promise<PostsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.type && params.type !== 'all') searchParams.append('type', params.type);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.author) searchParams.append('author', params.author);
  if (params?.featured) searchParams.append('featured', 'true');

  const url = `${API_BASE_URL}/posts?${searchParams.toString()}`;
  return fetchWithAuth(url);
}

// Get single post by ID
export async function fetchPostById(id: string): Promise<Post> {
  const url = `${API_BASE_URL}/posts/${id}`;
  return fetchWithAuth(url);
}

// Create new post (authenticated)
export async function createPost(data: CreatePostData): Promise<Post> {
  const url = `${API_BASE_URL}/posts`;
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update post (authenticated, own posts only)
export async function updatePost(id: string, data: Partial<CreatePostData>): Promise<Post> {
  const url = `${API_BASE_URL}/posts/${id}`;
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Delete post (authenticated, own posts only)
export async function deletePost(id: string): Promise<void> {
  const url = `${API_BASE_URL}/posts/${id}`;
  await fetchWithAuth(url, {
    method: 'DELETE',
  });
}

// Vote on post (like/dislike)
export async function voteOnPost(postId: string, type: 'like' | 'dislike'): Promise<void> {
  const url = `${API_BASE_URL}/posts/${postId}/vote`;
  await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

// Remove vote from post
export async function removeVoteFromPost(postId: string): Promise<void> {
  const url = `${API_BASE_URL}/posts/${postId}/vote`;
  await fetchWithAuth(url, {
    method: 'DELETE',
  });
}

// Bookmark/unbookmark post
export async function toggleBookmark(postId: string): Promise<{ bookmarked: boolean }> {
  const url = `${API_BASE_URL}/posts/${postId}/bookmark`;
  return fetchWithAuth(url, {
    method: 'POST',
  });
}

// Share post
export async function sharePost(postId: string, platform?: string): Promise<void> {
  const url = `${API_BASE_URL}/posts/${postId}/share`;
  await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });
}

// Track post view
export async function trackPostView(postId: string): Promise<void> {
  const url = `${API_BASE_URL}/posts/${postId}/view`;
  try {
    await fetchWithAuth(url, {
      method: 'POST',
    });
  } catch (error) {
    // Silently fail view tracking to not interrupt user experience
    console.warn('Failed to track post view:', error);
  }
}

// Get featured posts
export async function fetchFeaturedPosts(limit: number = 5): Promise<Post[]> {
  const response = await fetchPosts({ featured: true, limit });
  return response.posts;
}

// Get posts by specific user
export async function fetchUserPosts(
  username: string,
  page: number = 1,
  limit: number = 10,
): Promise<PostsResponse> {
  return fetchPosts({ author: username, page, limit });
}
