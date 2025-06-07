// Admin Comments API functions
import apiClient from '../../api-client';

// Admin Comment interface
export interface AdminComment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    role: string;
    is_banned: boolean;
  };
  post: {
    id: string;
    title: string;
    type: string;
    author_username: string;
  };
  parent_comment_id?: string;
  status: 'active' | 'hidden' | 'deleted' | 'pending';
  likes_count: number;
  dislikes_count: number;
  replies_count: number;
  is_reported: boolean;
  reports_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Backend Comment interface (minimal, expand as needed)
interface BackendComment {
  id: string;
  content: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
    avatar?: string;
  };
  postId: string;
  parentCommentId?: string;
  flagReason?: string;
  upvotes?: number;
  downvotes?: number;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Transform backend comment to admin comment format
function transformBackendCommentToAdminComment(backendComment: BackendComment): AdminComment {
  return {
    id: backendComment.id,
    content: backendComment.content,
    author: {
      id: backendComment.user?.id || '',
      username: backendComment.user?.username || '',
      email: backendComment.user?.email || '',
      avatar_url: backendComment.user?.avatar || undefined,
      role: 'user',
      is_banned: false,
    },
    post: {
      id: backendComment.postId,
      title: 'Post Title',
      type: 'general',
      author_username: 'Unknown',
    },
    parent_comment_id: backendComment.parentCommentId || undefined,
    status: backendComment.flagReason ? 'hidden' : 'active',
    likes_count: backendComment.upvotes || 0,
    dislikes_count: backendComment.downvotes || 0,
    replies_count: backendComment.replyCount || 0,
    is_reported: !!backendComment.flagReason,
    reports_count: backendComment.flagReason ? 1 : 0,
    is_pinned: false,
    created_at: backendComment.createdAt,
    updated_at: backendComment.updatedAt,
    deleted_at: backendComment.deletedAt || undefined,
  };
}

// Fetch specific comment by ID
export async function fetchCommentById(id: string): Promise<AdminComment> {
  try {
    const response = await apiClient.get(`/comments/${id}`);
    return transformBackendCommentToAdminComment(response.data as BackendComment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch comment: ${message}`);
  }
}

// Update comment status
export async function updateCommentStatus(
  id: string,
  status: 'active' | 'hidden' | 'pending',
): Promise<AdminComment> {
  try {
    let url: string;
    let response: { data: BackendComment };

    if (status === 'hidden') {
      url = `/comments/${id}/flag`;
      response = await apiClient.post(url, { reason: 'Admin action' });
    } else if (status === 'active') {
      url = `/comments/${id}/unflag`;
      response = await apiClient.post(url);
    } else {
      url = `/comments/${id}/status`;
      response = await apiClient.patch(url, { status });
    }

    return transformBackendCommentToAdminComment(response.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update comment status: ${message}`);
  }
}

// Toggle comment pin status
export async function toggleCommentPin(id: string): Promise<AdminComment> {
  try {
    // Note: This endpoint may not exist yet on the backend
    try {
      const response = await apiClient.patch(`/admin/comments/${id}/pin`);
      return transformBackendCommentToAdminComment(response.data as BackendComment);
    } catch {
      // If endpoint doesn't exist, fetch the comment with current state
      console.warn('Pin/unpin endpoint not implemented yet');
      return await fetchCommentById(id);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to toggle comment pin: ${message}`);
  }
}

// Delete comment
export async function deleteComment(id: string): Promise<void> {
  try {
    await apiClient.delete(`/comments/${id}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete comment: ${message}`);
  }
}
