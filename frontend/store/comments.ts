// frontend/store/comments.ts
import axios from '@/lib/api/axios';
import { create } from 'zustand';

// Comment interface matching backend CommentResponseDto
export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentCommentId?: string;
  user: {
    id: string;
    username: string;
    isVerified?: boolean;
    email: string;
  };
  upvotes: number;
  downvotes: number;
  userVote?: number | null;
  replyCount: number;
  flagReason?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  isDeleted?: boolean;
  deletedAt?: string | Date;
  isEdited?: boolean;
  mentionedUsers?: Array<{
    id: string;
    username: string;
  }>;
  replies?: Comment[];
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  parentCommentId?: string;
}

// Extend this for replies with nested structure
export interface CommentWithReplies extends Comment {
  replies?: Comment[];
  showReplies?: boolean;
  repliesLoading?: boolean;
  replyCount: number;
}

interface CommentsState {
  // Data
  commentsByPost: Record<string, CommentWithReplies[]>;
  currentComment: Comment | null;

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Reply System
  replyingTo: string | null;
  editingComment: Comment | null;
}

interface CommentsActions {
  // CRUD Operations
  fetchComments: (postId: string, params?: FetchCommentsParams) => Promise<void>;
  createComment: (data: CreateCommentData) => Promise<Comment>;
  updateComment: (id: string, data: UpdateCommentData) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;

  // Interactions
  voteOnComment: (id: string, value: 1 | -1) => Promise<void>;
  reportComment: (id: string, reason: string) => Promise<void>;

  // UI Management
  setReplyingTo: (commentId: string | null) => void;
  setEditingComment: (comment: Comment | null) => void;

  // Utility
  clearCommentsForPost: (postId: string) => void;
  clearError: () => void;
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

export const useCommentsStore = create<CommentsState & CommentsActions>((set, get) => ({
  commentsByPost: {},
  currentComment: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  replyingTo: null,
  editingComment: null,

  async fetchComments(postId, params) {
    set({ isLoading: true, error: null });
    try {
      const searchParams = new URLSearchParams();
      if (postId) searchParams.append('postId', postId);
      if (params?.parentCommentId) searchParams.append('parentCommentId', params.parentCommentId);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      const url = `${API_BASE_URL}/comments?${searchParams.toString()}`;
      const data = await axiosWithAuth({ url, method: 'GET' });
      set(state => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: data.comments,
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  async createComment(data) {
    set({ isSubmitting: true, error: null });
    try {
      const url = `${API_BASE_URL}/comments`;
      const comment = await axiosWithAuth({ url, method: 'POST', data });
      set(state => {
        const postId = data.postId;
        return {
          commentsByPost: {
            ...state.commentsByPost,
            [postId]: [comment, ...(state.commentsByPost[postId] || [])],
          },
          isSubmitting: false,
        };
      });
      return comment;
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false });
      throw error;
    }
  },

  async updateComment(id, data) {
    set({ isSubmitting: true, error: null });
    try {
      const url = `${API_BASE_URL}/comments/${id}`;
      const comment = await axiosWithAuth({ url, method: 'PATCH', data });
      set(state => {
        let postId = null;
        for (const pid in state.commentsByPost) {
          if (state.commentsByPost[pid].some(c => c.id === id)) {
            postId = pid;
            break;
          }
        }
        if (!postId) return { isSubmitting: false };
        return {
          commentsByPost: {
            ...state.commentsByPost,
            [postId]: state.commentsByPost[postId].map(c => (c.id === id ? comment : c)),
          },
          isSubmitting: false,
        };
      });
      return comment;
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false });
      throw error;
    }
  },

  async deleteComment(id) {
    set({ isSubmitting: true, error: null });
    try {
      const url = `${API_BASE_URL}/comments/${id}`;
      await axiosWithAuth({ url, method: 'DELETE' });
      set(state => {
        const updated = { ...state.commentsByPost };
        for (const pid in updated) {
          updated[pid] = updated[pid].filter(c => c.id !== id);
        }
        return { commentsByPost: updated, isSubmitting: false };
      });
    } catch (error: any) {
      set({ error: error.message, isSubmitting: false });
      throw error;
    }
  },

  async voteOnComment(id, value) {
    try {
      const url = `${API_BASE_URL}/comments/${id}/vote`;
      await axiosWithAuth({ url, method: 'POST', data: { value } });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  async reportComment(id, reason) {
    try {
      const url = `${API_BASE_URL}/comments/${id}/report`;
      await axiosWithAuth({ url, method: 'POST', data: { reason } });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setReplyingTo(commentId) {
    set({ replyingTo: commentId });
  },
  setEditingComment(comment) {
    set({ editingComment: comment });
  },
  clearCommentsForPost(postId) {
    set(state => {
      const updated = { ...state.commentsByPost };
      delete updated[postId];
      return { commentsByPost: updated };
    });
  },
  clearError() {
    set({ error: null });
  },
}));
