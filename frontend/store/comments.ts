// ===============================
// Komment és admin komment store (Zustand)
// Ez a file tartalmazza az összes komment és adminisztrátori komment műveletet egy helyen.
// Átlátható szekciók, magyar kommentek, könnyen bővíthető szerkezet.
// ===============================

// ---- Importok ----
import axios from '@/lib/axios';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ---- Helper függvények ----
// Auth token lekérése localStorage-ból
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Authentikált axios kérés helper
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

// ---- Interface-k ----
// Komment interfész (felhasználói nézethez)
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

// Admin-specifikus komment interfész
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

// Statisztikai interfész az admin dashboardhoz
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

// Admin komment szűrési paraméterek
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

// Admin kommentek válasza oldaltöréssel
export interface AdminCommentsResponse {
  comments: AdminComment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Felhasználói kommentek válasza oldaltöréssel
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

// Kiterjesztett komment válaszokkal, beágyazott struktúrával
export interface CommentWithReplies extends Comment {
  replies?: Comment[];
  showReplies?: boolean;
  repliesLoading?: boolean;
  replyCount: number;
}

// ---- Store state ----
// Kiterjesztett állapot interfész admin funkciókkal
interface CommentsState {
  // Rendszerint felhasználói adatok
  commentsByPost: Record<string, CommentWithReplies[]>;
  currentComment: Comment | null;

  // Admin-specifikus adatok
  adminComments: AdminComment[];
  commentsStats: CommentsStats | null;

  // Admin lapozás és szűrés
  adminPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  adminFilters: AdminCommentsParams;

  // Admin UI állapot
  selectedCommentIds: string[];

  // UI állapot
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Admin betöltési állapotok
  isLoadingAdminComments: boolean;
  isLoadingStats: boolean;

  // Válasz rendszer
  replyingTo: string | null;
  editingComment: Comment | null;
}

// ---- Store actions ----
// Kiterjesztett akció interfész admin funkciókkal
interface CommentsActions {
  // Helper functions
  transformBackendCommentToAdminComment: (backendComment: any) => AdminComment;

  // Rendszerint CRUD műveletek
  fetchComments: (postId: string, params?: FetchCommentsParams) => Promise<void>;
  createComment: (data: CreateCommentData) => Promise<Comment>;
  updateComment: (id: string, data: UpdateCommentData) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;

  // Admin CRUD műveletek
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

  // Admin UI kezelés
  setAdminFilters: (filters: Partial<AdminCommentsParams>) => void;
  setAdminPage: (page: number) => void;
  toggleCommentSelection: (id: string) => void;
  selectAllComments: () => void;
  clearCommentSelection: () => void;

  // Rendszerint interakciók
  voteOnComment: (id: string, value: 1 | -1) => Promise<void>;
  reportComment: (id: string, reason: string) => Promise<void>;

  // UI kezelés
  setReplyingTo: (commentId: string | null) => void;
  setEditingComment: (comment: Comment | null) => void;

  // Segédprogram
  clearCommentsForPost: (postId: string) => void;
  clearError: () => void;
}

export const useCommentsStore = create<CommentsState & CommentsActions>()(
  devtools(
    (set, get) => ({
      // Kezdeti állapot
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

      // Rendszerint felhasználói metódusok
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

      // Helper: Transform backend CommentResponseDto to frontend AdminComment
      transformBackendCommentToAdminComment(backendComment: any): AdminComment {
        return {
          id: backendComment.id,
          content: backendComment.content,
          author: {
            id: backendComment.user?.id || '',
            username: backendComment.user?.username || '',
            email: backendComment.user?.email || '',
            avatar_url: backendComment.user?.avatar || undefined,
            role: 'user', // Backend doesn't provide role in comment, defaulting to user
            is_banned: false, // Backend doesn't provide ban status in comment, defaulting to false
          },
          post: {
            id: backendComment.postId,
            title: 'Post Title', // Backend doesn't provide post title in comment response, would need separate call
            type: 'general', // Backend doesn't provide post type in comment response, defaulting to general
            author_username: 'Unknown', // Backend doesn't provide post author in comment response
          },
          parent_comment_id: backendComment.parentCommentId || undefined,
          status: backendComment.flagReason ? 'hidden' : 'active', // Determine status based on flagReason
          likes_count: backendComment.upvotes || 0,
          dislikes_count: backendComment.downvotes || 0,
          replies_count: backendComment.replyCount || 0,
          is_reported: !!backendComment.flagReason,
          reports_count: backendComment.flagReason ? 1 : 0, // Backend doesn't provide exact count
          is_pinned: false, // Backend doesn't provide pinned status, defaulting to false
          created_at: backendComment.createdAt,
          updated_at: backendComment.updatedAt,
          deleted_at: backendComment.deletedAt || undefined,
        };
      },

      // Admin-specifikus metódusok
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

          // Build search parameters for API call
          const searchParams = new URLSearchParams();
          Object.entries(finalParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              // Map frontend filter names to backend parameter names
              const backendKey =
                key === 'post_id'
                  ? 'postId'
                  : key === 'author_id'
                    ? 'authorId'
                    : key === 'sort'
                      ? 'sortBy'
                      : key;
              searchParams.append(backendKey, value.toString());
            }
          });

          // Real API call to admin comments endpoint
          const url = `${API_BASE_URL}/admin/comments?${searchParams.toString()}`;
          const response = await axiosWithAuth({ url, method: 'GET' });

          // Transform backend response to frontend format
          const transformedComments: AdminComment[] = response.comments.map((comment: any) =>
            get().transformBackendCommentToAdminComment(comment),
          );

          const adminResponse: AdminCommentsResponse = {
            comments: transformedComments,
            meta: response.meta,
          };

          set({
            adminComments: adminResponse.comments,
            adminPagination: adminResponse.meta,
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
          // Real API call to admin comments stats endpoint
          const url = `${API_BASE_URL}/admin/comments/stats`;
          const backendStats = await axiosWithAuth({ url, method: 'GET' });

          // Transform backend CommentStatsDto to frontend CommentsStats
          const frontendStats: CommentsStats = {
            total: backendStats.total || 0,
            active: backendStats.active || 0,
            hidden: backendStats.flagged || 0, // Map flagged to hidden
            pending: 0, // Backend doesn't provide pending count, defaulting to 0
            reported: backendStats.reported || 0,
            pinned: 0, // Backend doesn't provide pinned count, defaulting to 0
            totalLikes: 0, // Backend doesn't provide total likes in stats, defaulting to 0
            recentComments: backendStats.recentComments || 0,
          };

          set({ commentsStats: frontendStats, isLoadingStats: false });
        } catch (error: any) {
          set({ error: error.message, isLoadingStats: false });
        }
      },

      async fetchAdminCommentById(id) {
        try {
          // Real API call to get specific comment by ID
          const url = `${API_BASE_URL}/admin/comments/${id}`;
          const backendComment = await axiosWithAuth({ url, method: 'GET' });

          // Transform backend response to frontend format
          return get().transformBackendCommentToAdminComment(backendComment);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      async updateCommentStatus(id, status) {
        set({ isSubmitting: true, error: null });
        try {
          let url: string;
          let method = 'POST';

          // Map frontend status to backend endpoint
          if (status === 'hidden') {
            url = `${API_BASE_URL}/admin/comments/${id}/flag`;
          } else if (status === 'active') {
            url = `${API_BASE_URL}/admin/comments/${id}/unflag`;
          } else {
            // For other statuses, use a generic approach (you may need to implement this endpoint)
            url = `${API_BASE_URL}/admin/comments/${id}/status`;
            method = 'PATCH';
          }

          const requestData =
            status === 'hidden'
              ? { reason: 'Admin action' }
              : status !== 'active'
                ? { status }
                : undefined;

          await axiosWithAuth({
            url,
            method,
            data: requestData,
          });

          // Update local state
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
          // Note: Backend doesn't have pin/unpin endpoints yet
          // This would need to be implemented on the backend
          const url = `${API_BASE_URL}/admin/comments/${id}/pin`;

          // For now, we'll use a PATCH request to toggle pin status
          // This endpoint would need to be implemented on the backend
          await axiosWithAuth({
            url,
            method: 'PATCH',
          });

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
          // If the endpoint doesn't exist yet, just update local state for now
          console.warn('Pin/unpin endpoint not implemented yet, updating local state only');
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
        }
      },

      async bulkDeleteComments(ids) {
        set({ isSubmitting: true, error: null });
        try {
          // Real API call for bulk comment actions
          const url = `${API_BASE_URL}/admin/comments/bulk-action`;
          await axiosWithAuth({
            url,
            method: 'POST',
            data: {
              commentIds: ids,
              action: 'delete',
            },
          });

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
          // Mock API hívás - cseréld le valós implementációra
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

      // Admin UI kezelés
      setAdminFilters(filters) {
        set(state => ({
          adminFilters: { ...state.adminFilters, ...filters },
          adminPagination: { ...state.adminPagination, page: 1 }, // Visszaállítás az első oldalra
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

      // Rendszerint felhasználói interakciók
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

      // UI kezelés
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
