// ===============================
// Poszt store (Zustand)
// Ez a file tartalmazza az összes poszt és admin poszt műveletet egy helyen.
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

// Post interface matching component expectations
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

// Admin-specific interfaces
export interface AdminPost extends Omit<Post, 'author'> {
  author?: {
    username: string;
    email: string;
    profile_image?: string;
    user_id?: string;
    reputation_score?: number;
  };
  is_reported?: boolean;
  reports_count?: number;
}

export interface PostsStats {
  total: number;
  published: number;
  draft: number;
  hidden: number;
  reported: number;
  totalViews: number;
  totalLikes: number;
  recentPosts: number;
}

export interface AdminPostsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  author?: string;
  sortBy?: 'created_at' | 'updated_at' | 'views_count' | 'likes_count' | 'reports_count';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminPostsResponse {
  posts: AdminPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export interface FetchPostsParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  author?: string;
  featured?: boolean;
}

// ---- Store state ----
interface PostsState {
  // Data
  posts: Post[];
  currentPost: Post | null;
  featuredPosts: Post[];

  // Admin data
  adminPosts: AdminPost[];
  postsStats: PostsStats | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasMore: boolean;

  // Admin pagination
  adminCurrentPage: number;
  adminTotalPages: number;
  adminTotalPosts: number;

  // Filters & Search
  searchQuery: string;
  selectedType: string;
  sortBy: string;

  // Admin filters
  adminFilters: {
    search: string;
    type: string;
    status: string;
    sortBy: string;
    sortOrder: string;
  };

  // UI State
  isLoading: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Admin UI state
  isLoadingAdminPosts: boolean;
  isLoadingStats: boolean;
  adminError: string | null;

  // Cache for performance
  postsCache: Map<string, { posts: Post[]; meta: any; timestamp: number }>;

  // View tracking state
  viewedPosts: Set<string>;
  viewTrackingQueue: Map<string, number>; // post_id -> timestamp
}

// ---- Store actions ----
interface PostsActions {
  // CRUD Operations
  fetchPosts: (params?: FetchPostsParams, append?: boolean) => Promise<void>;
  fetchFeaturedPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  fetchUserPosts: (
    username: string,
    page?: number,
    limit?: number,
  ) => Promise<{ posts: Post[]; meta: any }>;
  createPost: (data: any) => Promise<Post>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;

  // Interactions
  voteOnPost: (id: string, voteType: 'like' | 'dislike') => Promise<void>;
  removeVoteFromPost: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<{ bookmarked: boolean }>;
  sharePost: (id: string, platform?: string) => Promise<void>;
  trackPostView: (id: string) => Promise<void>;

  // Admin-specific actions
  fetchAdminPosts: (params?: AdminPostsParams) => Promise<void>;
  fetchPostsStats: () => Promise<void>;
  togglePostFeature: (id: string, featured: boolean) => Promise<void>;
  togglePostVisibility: (id: string, hidden: boolean) => Promise<void>;
  bulkDeletePosts: (postIds: string[]) => Promise<void>;
  bulkUpdatePosts: (postIds: string[], updates: Partial<AdminPost>) => Promise<void>;

  // Local state management
  updatePostLocally: (id: string, updates: Partial<Post>) => void;
  removePostLocally: (id: string) => void;
  addPostLocally: (post: Post) => void;

  // Filters & Search
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: string) => void;
  setSortBy: (sortBy: string) => void;
  setAdminFilters: (filters: Partial<PostsState['adminFilters']>) => void;

  // Pagination
  setCurrentPage: (page: number) => void;
  setAdminCurrentPage: (page: number) => void;
  resetPagination: () => void;

  // Utility
  clearError: () => void;
  clearAdminError: () => void;
  clearCache: () => void;
  clearViewTracking: () => void;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const generateCacheKey = (params: FetchPostsParams = {}) => {
  return JSON.stringify({
    search: params.search || '',
    type: params.type || 'all',
    author: params.author || '',
    featured: params.featured || false,
    page: params.page || 1,
    limit: params.limit || 10,
  });
};

// Helper function to initialize viewed posts from localStorage
const initializeViewedPosts = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem('viewedPosts');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (error) {
    console.warn('Failed to load viewed posts from localStorage:', error);
    return new Set();
  }
};

// ---- Zustand store létrehozása ----
export const usePostsStore = create<PostsState & PostsActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      posts: [],
      currentPost: null,
      featuredPosts: [],
      adminPosts: [],
      postsStats: null,
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0,
      hasMore: false,
      adminCurrentPage: 1,
      adminTotalPages: 1,
      adminTotalPosts: 0,
      searchQuery: '',
      selectedType: 'all',
      sortBy: 'newest',
      adminFilters: {
        search: '',
        type: 'all',
        status: 'all',
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
      isLoading: false,
      isLoadingMore: false,
      isSubmitting: false,
      error: null,
      isLoadingAdminPosts: false,
      isLoadingStats: false,
      adminError: null,
      postsCache: new Map(),

      // View tracking state
      viewedPosts: initializeViewedPosts(),
      viewTrackingQueue: new Map(),

      // Actions
      fetchPosts: async (params = {}, append = false) => {
        const cacheKey = generateCacheKey(params);
        const cache = get().postsCache.get(cacheKey);
        const now = Date.now();

        // Check cache first
        if (cache && now - cache.timestamp < CACHE_DURATION) {
          set({
            posts: append ? [...get().posts, ...cache.posts] : cache.posts,
            totalPosts: cache.meta.total,
            totalPages: cache.meta.totalPages,
            currentPage: params.page || 1,
            hasMore: (params.page || 1) < cache.meta.totalPages,
            isLoading: false,
            error: null,
          });
          return;
        }

        try {
          set({
            isLoading: !append,
            isLoadingMore: append,
            error: null,
          });

          const searchParams = new URLSearchParams();
          if (params?.page) searchParams.append('page', params.page.toString());
          if (params?.limit) searchParams.append('limit', params.limit.toString());
          if (params?.type && params.type !== 'all') searchParams.append('type', params.type);
          if (params?.search) searchParams.append('search', params.search);
          if (params?.author) searchParams.append('author', params.author);
          if (params?.featured) searchParams.append('featured', 'true');

          const response: PostsResponse = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/posts?${searchParams.toString()}`,
          });

          // Update cache
          get().postsCache.set(cacheKey, {
            posts: response.posts,
            meta: {
              total: response.total,
              totalPages: response.totalPages,
            },
            timestamp: now,
          });

          set({
            posts: append ? [...get().posts, ...response.posts] : response.posts,
            totalPosts: response.total,
            totalPages: response.totalPages,
            currentPage: params.page || 1,
            hasMore: (params.page || 1) < response.totalPages,
            isLoading: false,
            isLoadingMore: false,
            error: null,
          });
        } catch (error) {
          console.error('Error fetching posts:', error);
          set({
            isLoading: false,
            isLoadingMore: false,
            error: error instanceof Error ? error.message : 'Failed to fetch posts',
          });
        }
      },

      fetchFeaturedPosts: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/posts?featured=true&limit=10`,
          });
          set({
            featuredPosts: response.posts || response,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error fetching featured posts:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch featured posts',
          });
        }
      },

      fetchPostById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const post = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/posts/${id}`,
          });
          set({
            currentPost: post,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error fetching post:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch post',
          });
        }
      },

      fetchUserPosts: async (username: string, page: number = 1, limit: number = 10) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/posts/user/${username}?page=${page}&limit=${limit}`,
          });
          set({ isLoading: false });
          return response;
        } catch (error) {
          console.error('Error fetching user posts:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user posts',
          });
          throw error;
        }
      },

      createPost: async (data: any) => {
        try {
          set({ isSubmitting: true, error: null });
          const newPost = await axiosWithAuth({
            method: 'POST',
            url: `${API_BASE_URL}/posts`,
            data,
          });

          // Add to beginning of posts list
          set(state => ({
            posts: [newPost, ...state.posts],
            totalPosts: state.totalPosts + 1,
            isSubmitting: false,
          }));

          // Clear cache to force refresh
          get().clearCache();

          return newPost;
        } catch (error) {
          console.error('Error creating post:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
          set({ error: errorMessage, isSubmitting: false });
          throw error;
        }
      },

      updatePost: async (id: string, updates: Partial<Post>) => {
        try {
          set({ isSubmitting: true, error: null });
          const updatedPost = await axiosWithAuth({
            method: 'PATCH',
            url: `${API_BASE_URL}/posts/${id}`,
            data: updates,
          });

          // Update in posts list
          set(state => ({
            posts: state.posts.map(post => (post.id === id ? { ...post, ...updatedPost } : post)),
            currentPost:
              state.currentPost?.id === id
                ? { ...state.currentPost, ...updatedPost }
                : state.currentPost,
            isSubmitting: false,
          }));

          // Clear cache to force refresh
          get().clearCache();
        } catch (error) {
          console.error('Error updating post:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
          set({ error: errorMessage, isSubmitting: false });
          throw error;
        }
      },

      deletePost: async (id: string) => {
        try {
          set({ isSubmitting: true, error: null });
          await axiosWithAuth({
            method: 'DELETE',
            url: `${API_BASE_URL}/posts/${id}`,
          });

          // Remove from posts list
          set(state => ({
            posts: state.posts.filter(post => post.id !== id),
            adminPosts: state.adminPosts.filter(post => post.id !== id),
            totalPosts: state.totalPosts - 1,
            currentPost: state.currentPost?.id === id ? null : state.currentPost,
            isSubmitting: false,
          }));

          // Clear cache to force refresh
          get().clearCache();
        } catch (error) {
          console.error('Error deleting post:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
          set({ error: errorMessage, isSubmitting: false });
          throw error;
        }
      },

      voteOnPost: async (id: string, voteType: 'like' | 'dislike') => {
        // Optimistic update
        const originalPost = get().posts.find(p => p.id === id);
        if (originalPost) {
          get().updatePostLocally(id, {
            likes_count:
              voteType === 'like' ? originalPost.likes_count + 1 : originalPost.likes_count,
            dislikes_count:
              voteType === 'dislike'
                ? originalPost.dislikes_count + 1
                : originalPost.dislikes_count,
            user_vote: voteType,
          });
        }

        try {
          await axiosWithAuth({
            method: 'POST',
            url: `${API_BASE_URL}/posts/${id}/vote`,
            data: { type: voteType },
          });
        } catch (error) {
          // Revert optimistic update on error
          if (originalPost) {
            get().updatePostLocally(id, originalPost);
          }
          console.error('Error voting on post:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to vote on post';
          set({ error: errorMessage });
          throw error;
        }
      },

      removeVoteFromPost: async (id: string) => {
        const originalPost = get().posts.find(p => p.id === id);
        if (originalPost?.user_vote) {
          // Optimistic update
          get().updatePostLocally(id, {
            likes_count:
              originalPost.user_vote === 'like'
                ? originalPost.likes_count - 1
                : originalPost.likes_count,
            dislikes_count:
              originalPost.user_vote === 'dislike'
                ? originalPost.dislikes_count - 1
                : originalPost.dislikes_count,
            user_vote: null,
          });
        }

        try {
          await axiosWithAuth({
            method: 'DELETE',
            url: `${API_BASE_URL}/posts/${id}/vote`,
          });
        } catch (error) {
          // Revert optimistic update on error
          if (originalPost) {
            get().updatePostLocally(id, originalPost);
          }
          console.error('Error removing vote from post:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove vote';
          set({ error: errorMessage });
          throw error;
        }
      },

      toggleBookmark: async (id: string) => {
        try {
          const result = await axiosWithAuth({
            method: 'POST',
            url: `${API_BASE_URL}/posts/${id}/bookmark`,
          });
          get().updatePostLocally(id, {
            user_bookmarked: result.bookmarked,
            bookmarks_count:
              get().posts.find(p => p.id === id)?.bookmarks_count ||
              0 + (result.bookmarked ? 1 : -1),
          });
          return result;
        } catch (error) {
          console.error('Error toggling bookmark:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to toggle bookmark';
          set({ error: errorMessage });
          throw error;
        }
      },

      sharePost: async (id: string, platform?: string) => {
        try {
          await axiosWithAuth({
            method: 'POST',
            url: `${API_BASE_URL}/posts/${id}/share`,
            data: { platform },
          });
        } catch (error) {
          console.error('Error sharing post:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to share post';
          set({ error: errorMessage });
          throw error;
        }
      },

      trackPostView: async (id: string) => {
        try {
          const state = get();
          const now = Date.now();

          // Load viewed posts from localStorage for session persistence
          const storedViewedPosts =
            typeof window !== 'undefined'
              ? JSON.parse(localStorage.getItem('viewedPosts') || '[]')
              : [];
          const sessionViewedPosts = new Set([...state.viewedPosts, ...storedViewedPosts]);

          // Check if post was already viewed in this session or previously stored
          if (sessionViewedPosts.has(id)) {
            return;
          }

          // Check if tracking is already queued/throttled for this post
          const lastTracked = state.viewTrackingQueue.get(id);

          // Enhanced throttle: Only track once per post per 2 minutes (120 seconds)
          if (lastTracked && now - lastTracked < 120000) {
            return;
          }

          // Debounce rapid successive calls - delay execution
          if (state.viewTrackingQueue.has(id)) {
            const pendingTime = state.viewTrackingQueue.get(id);
            if (pendingTime && now - pendingTime < 5000) {
              // 5 second debounce
              return;
            }
          }

          // Mark as pending in tracking queue first (prevents race conditions)
          set(currentState => {
            currentState.viewTrackingQueue.set(id, now);
            return { viewTrackingQueue: new Map(currentState.viewTrackingQueue) };
          });

          // Clean up old entries from tracking queue (older than 10 minutes)
          const cleanupQueue = new Map(state.viewTrackingQueue);
          for (const [postId, timestamp] of cleanupQueue.entries()) {
            if (now - timestamp > 600000) {
              // 10 minutes
              cleanupQueue.delete(postId);
            }
          }

          // Implement exponential backoff for rate limited requests
          let retryDelay = 1000; // Start with 1 second
          let maxRetries = 3;
          let attempt = 0;

          while (attempt < maxRetries) {
            try {
              await axiosWithAuth({
                method: 'POST',
                url: `${API_BASE_URL}/posts/${id}/view`,
              });

              // Success: Mark as viewed and persist to localStorage
              set(currentState => {
                const newViewedPosts = new Set([...currentState.viewedPosts, id]);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('viewedPosts', JSON.stringify([...newViewedPosts]));
                }
                return {
                  viewedPosts: newViewedPosts,
                  viewTrackingQueue: cleanupQueue,
                };
              });

              break; // Success, exit retry loop
            } catch (error: any) {
              attempt++;

              if (error.response?.status === 429) {
                // Rate limited - implement exponential backoff
                if (attempt < maxRetries) {
                  console.warn(
                    `Post view tracking rate limited, retrying in ${retryDelay}ms (attempt ${attempt}/${maxRetries})`,
                  );
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  retryDelay *= 2; // Exponential backoff
                } else {
                  // Max retries reached, give up for this post
                  console.warn(
                    `Post view tracking failed after ${maxRetries} attempts, giving up for post ${id}`,
                  );
                  set(currentState => {
                    currentState.viewTrackingQueue.delete(id);
                    return { viewTrackingQueue: new Map(currentState.viewTrackingQueue) };
                  });
                }
              } else {
                // Other error - don't retry
                console.warn('Failed to track post view:', error);
                set(currentState => {
                  currentState.viewTrackingQueue.delete(id);
                  return { viewTrackingQueue: new Map(currentState.viewTrackingQueue) };
                });
                break;
              }
            }
          }
        } catch (error) {
          console.warn('Failed to track post view:', error);
          // Clean up tracking queue on error
          set(currentState => {
            currentState.viewTrackingQueue.delete(id);
            return { viewTrackingQueue: new Map(currentState.viewTrackingQueue) };
          });
        }
      },

      // Admin-specific actions
      fetchAdminPosts: async (params = {}) => {
        try {
          set({ isLoadingAdminPosts: true, adminError: null });
          const searchParams = new URLSearchParams();

          Object.entries(params).forEach(([key, value]) => {
            if (value && value !== 'all') {
              searchParams.append(key, value.toString());
            }
          });

          const response = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/posts?${searchParams.toString()}`,
          });

          // Transform regular posts to admin posts format
          const adminPosts: AdminPost[] =
            response.posts?.map((post: any) => ({
              ...post,
              is_reported: post.is_reported || false,
              reports_count: post.reports_count || 0,
            })) || [];

          set({
            adminPosts,
            adminTotalPosts: response.total || adminPosts.length,
            adminTotalPages:
              response.totalPages || Math.ceil(adminPosts.length / (params.limit || 10)),
            adminCurrentPage: params.page || 1,
            isLoadingAdminPosts: false,
            adminError: null,
          });
        } catch (error) {
          console.error('Error fetching admin posts:', error);
          set({
            isLoadingAdminPosts: false,
            adminError: error instanceof Error ? error.message : 'Failed to fetch admin posts',
          });
        }
      },

      fetchPostsStats: async () => {
        try {
          set({ isLoadingStats: true, adminError: null });

          // Since we don't have a dedicated stats endpoint, calculate from posts
          const response = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/posts?limit=1000`,
          });

          const posts = response.posts || [];
          const stats: PostsStats = {
            total: posts.length,
            published: posts.filter((p: any) => p.status === 'published').length,
            draft: posts.filter((p: any) => p.status === 'draft').length,
            hidden: posts.filter((p: any) => p.status === 'hidden').length,
            reported: posts.filter((p: any) => p.is_reported).length,
            totalViews: posts.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0),
            totalLikes: posts.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0),
            recentPosts: posts.filter((p: any) => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(p.created_at) > weekAgo;
            }).length,
          };

          set({
            postsStats: stats,
            isLoadingStats: false,
            adminError: null,
          });
        } catch (error) {
          console.error('Error fetching posts stats:', error);
          set({
            isLoadingStats: false,
            adminError: error instanceof Error ? error.message : 'Failed to fetch posts stats',
          });
        }
      },

      togglePostFeature: async (id: string, featured: boolean) => {
        try {
          await get().updatePost(id, { is_featured: featured });
        } catch (error) {
          console.error('Error toggling post feature:', error);
          throw error;
        }
      },

      togglePostVisibility: async (id: string, hidden: boolean) => {
        try {
          const status = hidden ? 'hidden' : 'published';
          await get().updatePost(id, { status });
        } catch (error) {
          console.error('Error toggling post visibility:', error);
          throw error;
        }
      },

      bulkDeletePosts: async (postIds: string[]) => {
        try {
          set({ isSubmitting: true, adminError: null });
          await Promise.all(
            postIds.map(id =>
              axiosWithAuth({
                method: 'DELETE',
                url: `${API_BASE_URL}/posts/${id}`,
              }),
            ),
          );

          // Remove from local state
          set(state => ({
            posts: state.posts.filter(post => !postIds.includes(post.id)),
            adminPosts: state.adminPosts.filter(post => !postIds.includes(post.id)),
            totalPosts: state.totalPosts - postIds.length,
            adminTotalPosts: state.adminTotalPosts - postIds.length,
            isSubmitting: false,
          }));

          get().clearCache();
        } catch (error) {
          console.error('Error bulk deleting posts:', error);
          set({
            isSubmitting: false,
            adminError: error instanceof Error ? error.message : 'Failed to delete posts',
          });
          throw error;
        }
      },

      bulkUpdatePosts: async (postIds: string[], updates: Partial<AdminPost>) => {
        try {
          set({ isSubmitting: true, adminError: null });
          await Promise.all(
            postIds.map(id =>
              axiosWithAuth({
                method: 'PATCH',
                url: `${API_BASE_URL}/posts/${id}`,
                data: updates,
              }),
            ),
          );

          // Update local state
          set(state => {
            // Destructure updates to separate fields that are AdminPost-specific or have different types
            const {
              author: _adminAuthor, // Exclude admin-specific author type from Post updates
              is_reported: _is_reported, // Exclude AdminPost-specific field
              reports_count: _reports_count, // Exclude AdminPost-specific field
              ...postCompatibleUpdates // These are updates applicable to Post fields (excluding author)
            } = updates;

            const newPosts = state.posts.map(p => {
              if (postIds.includes(p.id)) {
                // Apply only compatible updates to Post objects
                // This preserves Post['author'] and avoids adding AdminPost-only fields
                return { ...p, ...postCompatibleUpdates };
              }
              return p;
            });

            const newAdminPosts = state.adminPosts.map(adminPost => {
              // Corrected variable name here
              if (postIds.includes(adminPost.id)) {
                // For adminPosts, all updates can be applied as 'updates' is Partial<AdminPost>
                return { ...adminPost, ...updates };
              }
              return adminPost;
            });

            return {
              posts: newPosts,
              adminPosts: newAdminPosts,
              isSubmitting: false,
            };
          });

          get().clearCache();
        } catch (error) {
          console.error('Error bulk updating posts:', error);
          set({
            isSubmitting: false,
            adminError: error instanceof Error ? error.message : 'Failed to update posts',
          });
          throw error;
        }
      },

      // Local state updates
      updatePostLocally: (id: string, updates: Partial<Post>) => {
        set(state => {
          // Destructure 'updates' (Partial<Post>).
          // We separate 'author' because Post['author'] and AdminPost['author'] have different types.
          // 'otherUpdatesCompatibleWithAdminPost' will contain all fields from 'updates' except 'author'.
          const { author: _postAuthorSpecificUpdate, ...otherUpdatesCompatibleWithAdminPost } =
            updates;

          return {
            // For posts, featuredPosts, and currentPost, 'updates' (Partial<Post>) can be applied directly.
            posts: state.posts.map(p => (p.id === id ? { ...p, ...updates } : p)),
            featuredPosts: state.featuredPosts.map(fp =>
              fp.id === id ? { ...fp, ...updates } : fp,
            ),
            currentPost:
              state.currentPost?.id === id
                ? { ...state.currentPost, ...updates }
                : state.currentPost,
            // For adminPosts, apply only the updates that are compatible.
            // This excludes Post['author'] from being incorrectly applied to AdminPost['author'].
            adminPosts: state.adminPosts.map(adminP => {
              if (adminP.id === id) {
                return { ...adminP, ...otherUpdatesCompatibleWithAdminPost };
              }
              return adminP;
            }),
          };
        });
      },

      removePostLocally: (id: string) => {
        set(state => ({
          posts: state.posts.filter(post => post.id !== id),
          featuredPosts: state.featuredPosts.filter(post => post.id !== id),
          adminPosts: state.adminPosts.filter(post => post.id !== id),
          totalPosts: state.totalPosts - 1,
          currentPost: state.currentPost?.id === id ? null : state.currentPost,
        }));
      },

      addPostLocally: (post: Post) => {
        set(state => ({
          posts: [post, ...state.posts],
          totalPosts: state.totalPosts + 1,
        }));
      },

      // Filters & Search
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedType: (type: string) => {
        set({ selectedType: type });
      },

      setSortBy: (sortBy: string) => {
        set({ sortBy });
      },

      setAdminFilters: (filters: Partial<PostsState['adminFilters']>) => {
        set(state => ({
          adminFilters: { ...state.adminFilters, ...filters },
        }));
      },

      // Pagination
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
      },

      setAdminCurrentPage: (page: number) => {
        set({ adminCurrentPage: page });
      },

      resetPagination: () => {
        set({
          currentPage: 1,
          totalPages: 1,
          totalPosts: 0,
          hasMore: false,
        });
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      clearAdminError: () => {
        set({ adminError: null });
      },

      clearCache: () => {
        set({ postsCache: new Map() });
      },

      // Clear view tracking data from localStorage and state
      clearViewTracking: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('viewedPosts');
        }
        set({
          viewedPosts: new Set(),
          viewTrackingQueue: new Map(),
        });
      },

      reset: () => {
        set({
          posts: [],
          currentPost: null,
          featuredPosts: [],
          adminPosts: [],
          postsStats: null,
          currentPage: 1,
          totalPages: 1,
          totalPosts: 0,
          hasMore: false,
          adminCurrentPage: 1,
          adminTotalPages: 1,
          adminTotalPosts: 0,
          searchQuery: '',
          selectedType: 'all',
          sortBy: 'newest',
          adminFilters: {
            search: '',
            type: 'all',
            status: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc',
          },
          isLoading: false,
          isLoadingMore: false,
          isSubmitting: false,
          error: null,
          isLoadingAdminPosts: false,
          isLoadingStats: false,
          adminError: null,
          postsCache: new Map(),
          viewedPosts: new Set(),
          viewTrackingQueue: new Map(),
        });
      },
    }),
    {
      name: 'posts-store',
      partialize: (state: PostsState & PostsActions) => ({
        searchQuery: state.searchQuery,
        selectedType: state.selectedType,
        sortBy: state.sortBy,
        adminFilters: state.adminFilters,
      }),
    },
  ),
);
