// Re-export types and functions from the comments store
export type {
  Comment,
  CommentsResponse,
  CommentWithReplies,
  CreateCommentData,
  FetchCommentsParams,
  UpdateCommentData,
} from '@/store/comments';

// Re-export store functions for API compatibility
import { useCommentsStore } from '@/store/comments';

export const createComment = (data: CreateCommentData) =>
  useCommentsStore.getState().createComment(data);

export const updateComment = (id: string, data: UpdateCommentData) =>
  useCommentsStore.getState().updateComment(id, data);

export const deleteComment = (id: string) => useCommentsStore.getState().deleteComment(id);

export const voteOnComment = (id: string, value: 1 | -1) =>
  useCommentsStore.getState().voteOnComment(id, value);

export const reportComment = (id: string, reason: string) =>
  useCommentsStore.getState().reportComment(id, reason);

export const fetchComments = (postId: string, params?: FetchCommentsParams) =>
  useCommentsStore.getState().fetchComments(postId, params);

export const fetchCommentReplies = (commentId: string, params?: FetchCommentsParams) => {
  // For now, use the same fetchComments with parentCommentId
  return useCommentsStore.getState().fetchComments('', { ...params, parentCommentId: commentId });
};

// Import types for re-export
import type { CreateCommentData, FetchCommentsParams, UpdateCommentData } from '@/store/comments';
