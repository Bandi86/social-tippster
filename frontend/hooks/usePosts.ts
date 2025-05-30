import { usePostsStore } from '@/store/posts';

/**
 * Custom hook for accessing posts state and actions
 */
export const usePosts = () => {
  const store = usePostsStore();
  return {
    // Data
    posts: store.posts,
    currentPost: store.currentPost,
    featuredPosts: store.featuredPosts,

    // Admin data
    adminPosts: store.adminPosts,
    postsStats: store.postsStats,

    // Pagination
    currentPage: store.currentPage,
    totalPages: store.totalPages,
    totalPosts: store.totalPosts,
    hasMore: store.hasMore,

    // Admin pagination
    adminCurrentPage: store.adminCurrentPage,
    adminTotalPages: store.adminTotalPages,
    adminTotalPosts: store.adminTotalPosts,

    // Filters & Search
    searchQuery: store.searchQuery,
    selectedType: store.selectedType,
    sortBy: store.sortBy,

    // Admin filters
    adminFilters: store.adminFilters,

    // UI State
    isLoading: store.isLoading,
    isLoadingMore: store.isLoadingMore,
    isSubmitting: store.isSubmitting,
    error: store.error,

    // Admin UI state
    isLoadingAdminPosts: store.isLoadingAdminPosts,
    isLoadingStats: store.isLoadingStats,
    adminError: store.adminError,

    // CRUD Operations
    fetchPosts: store.fetchPosts,
    fetchFeaturedPosts: store.fetchFeaturedPosts,
    fetchPostById: store.fetchPostById,
    fetchUserPosts: store.fetchUserPosts,
    createPost: store.createPost,
    updatePost: store.updatePost,
    deletePost: store.deletePost,

    // Admin-specific actions
    fetchAdminPosts: store.fetchAdminPosts,
    fetchPostsStats: store.fetchPostsStats,
    togglePostFeature: store.togglePostFeature,
    togglePostVisibility: store.togglePostVisibility,
    bulkDeletePosts: store.bulkDeletePosts,
    bulkUpdatePosts: store.bulkUpdatePosts,

    // Interactions
    voteOnPost: store.voteOnPost,
    removeVoteFromPost: store.removeVoteFromPost,
    toggleBookmark: store.toggleBookmark,
    sharePost: store.sharePost,
    trackPostView: store.trackPostView,

    // Local state management
    updatePostLocally: store.updatePostLocally,
    removePostLocally: store.removePostLocally,
    addPostLocally: store.addPostLocally,

    // Filters & Search
    setSearchQuery: store.setSearchQuery,
    setSelectedType: store.setSelectedType,
    setSortBy: store.setSortBy,
    setAdminFilters: store.setAdminFilters,

    // Pagination
    setCurrentPage: store.setCurrentPage,
    setAdminCurrentPage: store.setAdminCurrentPage,
    resetPagination: store.resetPagination,

    // Utility
    clearError: store.clearError,
    clearAdminError: store.clearAdminError,
    clearCache: store.clearCache,
    reset: store.reset,
  };
};

export default usePosts;
