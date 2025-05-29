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

    // Pagination
    currentPage: store.currentPage,
    totalPages: store.totalPages,
    totalPosts: store.totalPosts,
    hasMore: store.hasMore,

    // Filters & Search
    searchQuery: store.searchQuery,
    selectedType: store.selectedType,
    sortBy: store.sortBy,

    // UI State
    isLoading: store.isLoading,
    isLoadingMore: store.isLoadingMore,
    isSubmitting: store.isSubmitting,
    error: store.error,

    // CRUD Operations
    fetchPosts: store.fetchPosts,
    fetchFeaturedPosts: store.fetchFeaturedPosts,
    fetchPostById: store.fetchPostById,
    createPost: store.createPost,
    updatePost: store.updatePost,
    deletePost: store.deletePost,

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

    // Pagination
    setCurrentPage: store.setCurrentPage,
    resetPagination: store.resetPagination,

    // Utility
    clearError: store.clearError,
    clearCache: store.clearCache,
    reset: store.reset,
  };
};

export default usePosts;
