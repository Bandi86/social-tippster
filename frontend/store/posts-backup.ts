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
}

interface PostsActions {
  // CRUD Operations
  fetchPosts: (params?: FetchPostsParams, append?: boolean) => Promise<void>;
  fetchFeaturedPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
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

  // Local state management
  updatePostLocally: (id: string, updates: Partial<Post>) => void;
  removePostLocally: (id: string) => void;
  addPostLocally: (post: Post) => void;

  // Filters & Search
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: string) => void;
  setSortBy: (sortBy: string) => void;

  // Pagination
  setCurrentPage: (page: number) => void;
  resetPagination: () => void;

  // Utility
  clearError: () => void;
  clearCache: () => void;
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
      isLoading: false,
      isLoadingMore: false,
      isSubmitting: false,
      error: null,
      isLoadingAdminPosts: false,
      isLoadingStats: false,
      adminError: null,
      postsCache: new Map(),

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
          const posts = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/posts?featured=true&limit=10`,
          });
          set({
            featuredPosts: posts,
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
          await axiosWithAuth({
            method: 'POST',
            url: `${API_BASE_URL}/posts/${id}/view`,
          });
        } catch (error) {
          // Silently fail view tracking
          console.warn('Failed to track post view:', error);
        }
      },

      // Admin-specific actions
      fetchAdminPosts: async (params = {}) => {
        try {
          set({ isLoadingAdminPosts: true, adminError: null });
          const response: AdminPostsResponse = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/admin/posts`,
            params,
          });
          set({
            adminPosts: response.posts,
            adminTotalPosts: response.total,
            adminTotalPages: response.totalPages,
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
          const stats = await axiosWithAuth({
            method: 'GET',
            url: `${API_BASE_URL}/admin/posts/stats`,
          });
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

      // Local state updates
      updatePostLocally: (id: string, updates: Partial<Post>) => {
        set(state => ({
          posts: state.posts.map(post => (post.id === id ? { ...post, ...updates } : post)),
          featuredPosts: state.featuredPosts.map(post =>
            post.id === id ? { ...post, ...updates } : post,
          ),
          currentPost:
            state.currentPost?.id === id ? { ...state.currentPost, ...updates } : state.currentPost,
          adminPosts: state.adminPosts.map(post => (post.id === id ? { ...post, ...updates } : post)),
        }));
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

      // Pagination
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
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

      clearCache: () => {
        set({ postsCache: new Map() });
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
          isLoading: false,
          isLoadingMore: false,
          isSubmitting: false,
          error: null,
          isLoadingAdminPosts: false,
          isLoadingStats: false,
          adminError: null,
          postsCache: new Map(),
        });
      },
    }),
    {
      name: 'posts-store',
      partialize: (state: PostsState & PostsActions) => ({
        searchQuery: state.searchQuery,
        selectedType: state.selectedType,
        sortBy: state.sortBy,
      }),
    },
  ),
);
