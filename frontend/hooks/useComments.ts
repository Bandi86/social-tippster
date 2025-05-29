import { useCommentsStore } from '@/store/comments';

/**
 * Custom hook for accessing comments state and actions
 */
export const useComments = () => {
  const store = useCommentsStore();
  return {
    commentsByPost: store.commentsByPost,
    currentComment: store.currentComment,
    isLoading: store.isLoading,
    isSubmitting: store.isSubmitting,
    error: store.error,
    replyingTo: store.replyingTo,
    editingComment: store.editingComment,
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
  };
};

export default useComments;
