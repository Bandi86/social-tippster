import { useCommentsStore } from '@/store/comments';

/**
 * Custom hook for accessing comments state and actions
 */
export const useComments = () => {
  const store = useCommentsStore();
  return {
    // Regular comment data
    commentsByPost: store.commentsByPost,
    currentComment: store.currentComment,

    // Admin comment data
    adminComments: store.adminComments,
    commentsStats: store.commentsStats,
    adminPagination: store.adminPagination,
    adminFilters: store.adminFilters,
    selectedCommentIds: store.selectedCommentIds,

    // UI State
    isLoading: store.isLoading,
    isSubmitting: store.isSubmitting,
    error: store.error,
    replyingTo: store.replyingTo,
    editingComment: store.editingComment,

    // Admin UI State
    isLoadingAdminComments: store.isLoadingAdminComments,
    isLoadingStats: store.isLoadingStats,

    // Regular comment actions
    fetchComments: store.fetchComments,
    createComment: store.createComment,
    updateComment: store.updateComment,
    deleteComment: store.deleteComment,
    voteOnComment: store.voteOnComment,
    reportComment: store.reportComment,
    setReplyingTo: store.setReplyingTo,
    setEditingComment: store.setEditingComment,
    clearCommentsForPost: store.clearCommentsForPost,
    clearError: store.clearError,

    // Admin comment actions
    fetchAdminComments: store.fetchAdminComments,
    fetchCommentsStats: store.fetchCommentsStats,
    fetchAdminCommentById: store.fetchAdminCommentById,
    updateCommentStatus: store.updateCommentStatus,
    toggleCommentPin: store.toggleCommentPin,
    bulkDeleteComments: store.bulkDeleteComments,
    bulkUpdateCommentsStatus: store.bulkUpdateCommentsStatus,

    // Admin filter and selection management
    setAdminFilters: store.setAdminFilters,
    setAdminPage: store.setAdminPage,
    toggleCommentSelection: store.toggleCommentSelection,
    selectAllComments: store.selectAllComments,
    clearCommentSelection: store.clearCommentSelection,
  };
};

export default useComments;
