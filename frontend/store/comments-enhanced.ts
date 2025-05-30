// Enhanced comments store with admin functionality
import axios from '@/lib/api/axios';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

// Regular Comment interface for user-facing functionality
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

// Admin-specific Comment interface
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

// Statistics interface for admin dashboard
export interface CommentsStats {
  total: number;
  active: number;
  hidden: number;
  pending: number;
  reported: number;
  pinned: number;
  totalLikes: number;
  recentComments: number;
}

// Admin comment filtering parameters
export interface AdminCommentsParams {
  search?: string;
  status?: string;
  post_id?: string;
  author_id?: string;
  is_reported?: boolean;
  is_pinned?: boolean;
  date_from?: string;
  date_to?: string;
  sort?: 'newest' | 'oldest' | 'most_liked' | 'most_reported' | 'most_replies';
  page?: number;
  limit?: number;
}

// Admin comments response with pagination
export interface AdminCommentsResponse {
  comments: AdminComment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Regular comments response for user-facing functionality
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

// Extended comment for replies with nested structure
export interface CommentWithReplies extends Comment {
  replies?: Comment[];
  showReplies?: boolean;
  repliesLoading?: boolean;
  replyCount: number;
}

// Enhanced state interface with admin functionality
interface CommentsState {
  // Regular user-facing data
  commentsByPost: Record<string, CommentWithReplies[]>;
  currentComment: Comment | null;

  // Admin-specific data
  adminComments: AdminComment[];
  commentsStats: CommentsStats | null;

  // Admin pagination and filtering
  adminPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  adminFilters: AdminCommentsParams;

  // Admin UI state
  selectedCommentIds: string[];

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Admin loading states
  isLoadingAdminComments: boolean;
  isLoadingStats: boolean;

  // Reply System
  replyingTo: string | null;
  editingComment: Comment | null;
}

// Enhanced actions interface with admin functionality
interface CommentsActions {
  // Regular CRUD Operations
  fetchComments: (postId: string, params?: FetchCommentsParams) => Promise<void>;
  createComment: (data: CreateCommentData) => Promise<Comment>;
  updateComment: (id: string, data: UpdateCommentData) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;

  // Admin CRUD Operations
  fetchAdminComments: (params?: AdminCommentsParams) => Promise<void>;
  fetchCommentsStats: () => Promise<void>;
  fetchAdminCommentById: (id: string) => Promise<AdminComment>;
  updateCommentStatus: (id: string, status: 'active' | 'hidden' | 'pending') => Promise<void>;
  toggleCommentPin: (id: string) => Promise<void>;
  bulkDeleteComments: (ids: string[]) => Promise<void>;
  bulkUpdateCommentsStatus: (
    ids: string[],
    status: 'active' | 'hidden' | 'pending',
  ) => Promise<void>;

  // Admin UI Management
  setAdminFilters: (filters: Partial<AdminCommentsParams>) => void;
  setAdminPage: (page: number) => void;
  toggleCommentSelection: (id: string) => void;
  selectAllComments: () => void;
  clearCommentSelection: () => void;

  // Regular Interactions
  voteOnComment: (id: string, value: 1 | -1) => Promise<void>;
  reportComment: (id: string, reason: string) => Promise<void>;

  // UI Management
  setReplyingTo: (commentId: string | null) => void;
  setEditingComment: (comment: Comment | null) => void;

  // Utility
  clearCommentsForPost: (postId: string) => void;
  clearError: () => void;
}

export const useCommentsStore = create<CommentsState & CommentsActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      commentsByPost: {},
      currentComment: null,
      adminComments: [],
      commentsStats: null,
      adminPagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      adminFilters: {},
      selectedCommentIds: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
      isLoadingAdminComments: false,
      isLoadingStats: false,
      replyingTo: null,
      editingComment: null,

      // Regular user-facing methods
      async fetchComments(postId, params) {
        set({ isLoading: true, error: null });
        try {
          const searchParams = new URLSearchParams();
          if (postId) searchParams.append('postId', postId);
          if (params?.parentCommentId)
            searchParams.append('parentCommentId', params.parentCommentId);
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

      // Admin-specific methods
      async fetchAdminComments(params = {}) {
        set({ isLoadingAdminComments: true, error: null });
        try {
          const { adminFilters, adminPagination } = get();
          const finalParams = {
            ...adminFilters,
            ...params,
            page: params.page || adminPagination.page,
            limit: params.limit || adminPagination.limit,
          };

          // Mock API call - in production this would be a real API call
          const searchParams = new URLSearchParams();
          Object.entries(finalParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              searchParams.append(key, value.toString());
            }
          });

          // Simulate admin API call
          await new Promise(resolve => setTimeout(resolve, 500));

          // Mock response - in production, replace with real API call
          const mockAdminComments: AdminComment[] = [
            {
              id: '1',
              content: 'Great tip! I followed this and won big. Thanks for sharing your analysis.',
              author: {
                id: 'user1',
                username: 'sportsfan123',
                email: 'sportsfan123@example.com',
                role: 'user',
                is_banned: false,
              },
              post: {
                id: 'post1',
                title: 'Manchester United vs Liverpool - Premier League Prediction',
                type: 'tip',
                author_username: 'tipster_pro',
              },
              status: 'active',
              likes_count: 12,
              dislikes_count: 1,
              replies_count: 3,
              is_reported: false,
              reports_count: 0,
              is_pinned: false,
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-15T10:30:00Z',
            },
            // Add more mock data as needed
          ];

          const response: AdminCommentsResponse = {
            comments: mockAdminComments,
            meta: {
              total: mockAdminComments.length,
              page: finalParams.page || 1,
              limit: finalParams.limit || 20,
              totalPages: Math.ceil(mockAdminComments.length / (finalParams.limit || 20)),
            },
          };

          set({
            adminComments: response.comments,
            adminPagination: response.meta,
            adminFilters: finalParams,
            isLoadingAdminComments: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoadingAdminComments: false });
        }
      },

      async fetchCommentsStats() {
        set({ isLoadingStats: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 300));

          const mockStats: CommentsStats = {
            total: 1250,
            active: 1180,
            hidden: 45,
            pending: 25,
            reported: 32,
            pinned: 8,
            totalLikes: 3420,
            recentComments: 89,
          };

          set({ commentsStats: mockStats, isLoadingStats: false });
        } catch (error: any) {
          set({ error: error.message, isLoadingStats: false });
        }
      },

      async fetchAdminCommentById(id) {
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 200));

          const { adminComments } = get();
          const comment = adminComments.find(c => c.id === id);
          if (!comment) {
            throw new Error('Comment not found');
          }
          return comment;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      async updateCommentStatus(id, status) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => ({
            adminComments: state.adminComments.map(comment =>
              comment.id === id
                ? { ...comment, status, updated_at: new Date().toISOString() }
                : comment,
            ),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async toggleCommentPin(id) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => ({
            adminComments: state.adminComments.map(comment =>
              comment.id === id
                ? {
                    ...comment,
                    is_pinned: !comment.is_pinned,
                    updated_at: new Date().toISOString(),
                  }
                : comment,
            ),
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async bulkDeleteComments(ids) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            adminComments: state.adminComments.filter(comment => !ids.includes(comment.id)),
            selectedCommentIds: [],
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      async bulkUpdateCommentsStatus(ids, status) {
        set({ isSubmitting: true, error: null });
        try {
          // Mock API call - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => ({
            adminComments: state.adminComments.map(comment =>
              ids.includes(comment.id)
                ? { ...comment, status, updated_at: new Date().toISOString() }
                : comment,
            ),
            selectedCommentIds: [],
            isSubmitting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isSubmitting: false });
          throw error;
        }
      },

      // Admin UI Management
      setAdminFilters(filters) {
        set(state => ({
          adminFilters: { ...state.adminFilters, ...filters },
          adminPagination: { ...state.adminPagination, page: 1 }, // Reset to first page
        }));
      },

      setAdminPage(page) {
        set(state => ({
          adminPagination: { ...state.adminPagination, page },
        }));
      },

      toggleCommentSelection(id) {
        set(state => ({
          selectedCommentIds: state.selectedCommentIds.includes(id)
            ? state.selectedCommentIds.filter(selectedId => selectedId !== id)
            : [...state.selectedCommentIds, id],
        }));
      },

      selectAllComments() {
        set(state => ({
          selectedCommentIds: state.adminComments.map(comment => comment.id),
        }));
      },

      clearCommentSelection() {
        set({ selectedCommentIds: [] });
      },

      // Regular user interactions
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

      // UI Management
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
    }),
    { name: 'comments-store' },
  ),
);
