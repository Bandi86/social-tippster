// User-facing Comments API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Comment interfaces
export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentCommentId?: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null; // User's current vote
  replyCount: number;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
}

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

// Get auth token from localStorage or cookie
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try localStorage first
  const token = localStorage.getItem('authToken');
  if (token) return token;

  // Fallback to cookie
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
  return authCookie ? authCookie.split('=')[1] : null;
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
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
      }
      throw new Error('Authentication required');
    }

    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response;
}

// Get comments for a post
export async function fetchComments(params: {
  postId?: string;
  parentCommentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<CommentsResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params.postId) searchParams.append('postId', params.postId);
    if (params.parentCommentId) searchParams.append('parentCommentId', params.parentCommentId);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/comments?${searchParams}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

// Get single comment by ID
export async function fetchCommentById(id: string): Promise<Comment> {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch comment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comment:', error);
    throw error;
  }
}

// Get replies for a comment
export async function fetchCommentReplies(
  commentId: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
): Promise<CommentsResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/replies?${searchParams}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch comment replies: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    throw error;
  }
}

// Create new comment (authenticated)
export async function createComment(data: CreateCommentData): Promise<Comment> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

// Update comment (authenticated, own comments only)
export async function updateComment(id: string, data: UpdateCommentData): Promise<Comment> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

// Delete comment (authenticated, own comments only)
export async function deleteComment(id: string): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Vote on comment (like/dislike)
export async function voteOnComment(commentId: string, value: 1 | -1): Promise<Comment> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/comments/${commentId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error voting on comment:', error);
    throw error;
  }
}

// Report comment
export async function reportComment(
  commentId: string,
  reason: string,
): Promise<{ message: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/comments/${commentId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error reporting comment:', error);
    throw error;
  }
}
