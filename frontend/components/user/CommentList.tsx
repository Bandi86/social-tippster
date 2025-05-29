'use client';

import { ChevronDown, Loader2, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useComments } from '@/hooks/useComments';
import { cn } from '@/lib/utils';
import type { Comment, CommentWithReplies } from '@/store/comments';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';

interface CommentListProps {
  postId: string;
  className?: string;
}

export default function CommentList({ postId, className }: CommentListProps) {
  const { isAuthenticated } = useAuth();
  const {
    commentsByPost,
    isLoading,
    error,
    replyingTo,
    editingComment,
    fetchComments,
    setReplyingTo,
    setEditingComment,
  } = useComments();

  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Get comments for this post from store
  const postComments = commentsByPost[postId] || [];

  useEffect(() => {
    // Load comments when component mounts or postId changes
    fetchComments(postId, { page: 1, limit: 10, sortBy });
  }, [postId, sortBy, fetchComments]);

  useEffect(() => {
    // Update local state when store comments change
    const commentsWithReplies: CommentWithReplies[] = postComments.map(comment => ({
      ...comment,
      showReplies: false,
      repliesLoading: false,
    }));
    setComments(commentsWithReplies);
  }, [postComments]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchComments(postId, { page: page + 1, limit: 10, sortBy });
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as 'newest' | 'oldest' | 'popular');
    setPage(1);
    setComments([]);
  };

  const handleCommentSubmit = (newComment: Comment) => {
    if (editingComment) {
      // Update existing comment
      setComments(prev =>
        prev.map(comment =>
          comment.id === newComment.id
            ? { ...newComment, replies: comment.replies, showReplies: comment.showReplies }
            : comment,
        ),
      );
      setEditingComment(null);
    } else if (replyingTo) {
      // Add reply to parent comment
      setComments(prev =>
        prev.map(comment => {
          if (comment.id === replyingTo) {
            const updatedReplies = comment.replies
              ? [...comment.replies, newComment]
              : [newComment];
            return {
              ...comment,
              replies: updatedReplies,
              replyCount: comment.replyCount + 1,
              showReplies: true,
            };
          }
          return comment;
        }),
      );
      setReplyingTo(null);
    } else {
      // Add new top-level comment
      const commentWithReplies: CommentWithReplies = {
        ...newComment,
        replies: [],
        showReplies: false,
        repliesLoading: false,
      };
      setComments(prev => [commentWithReplies, ...prev]);
      setTotal(prev => prev + 1);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        }
        // Check replies
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply =>
            reply.id === updatedComment.id ? updatedComment : reply,
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      }),
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(prev => {
      // Remove from top-level comments
      let filtered = prev.filter(comment => comment.id !== commentId);

      // Remove from replies
      filtered = filtered.map(comment => ({
        ...comment,
        replies: comment.replies?.filter(reply => reply.id !== commentId) || [],
      }));

      return filtered;
    });
    setTotal(prev => prev - 1);
  };

  const handleReply = (parentCommentId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A válaszoláshoz be kell jelentkezned.',
        variant: 'destructive',
      });
      return;
    }
    setReplyingTo(parentCommentId);
    setEditingComment(null);
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const handleToggleReplies = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (comment.showReplies) {
      // Hide replies
      setComments(prev => prev.map(c => (c.id === commentId ? { ...c, showReplies: false } : c)));
    } else {
      // Load and show replies
      if (!comment.replies || comment.replies.length === 0) {
        setComments(prev =>
          prev.map(c => (c.id === commentId ? { ...c, repliesLoading: true } : c)),
        );

        try {
          // Fetch replies using the comments store
          await fetchComments(postId, { parentCommentId: commentId, page: 1, limit: 50 });

          // Note: In a full implementation, we'd need to handle nested replies differently
          // For now, we'll just show that replies are loaded
          setComments(prev =>
            prev.map(c =>
              c.id === commentId
                ? {
                    ...c,
                    showReplies: true,
                    repliesLoading: false,
                  }
                : c,
            ),
          );
        } catch (error) {
          console.error('Error loading replies:', error);
          toast({
            title: 'Hiba történt',
            description: 'Nem sikerült betölteni a válaszokat.',
            variant: 'destructive',
          });
          setComments(prev =>
            prev.map(c => (c.id === commentId ? { ...c, repliesLoading: false } : c)),
          );
        }
      } else {
        // Just show existing replies
        setComments(prev => prev.map(c => (c.id === commentId ? { ...c, showReplies: true } : c)));
      }
    }
  };

  if (isLoading && comments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin mr-2' />
            <span>Kommentek betöltése...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Kommentek ({total})
            </CardTitle>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Legújabb</SelectItem>
                <SelectItem value='oldest'>Legrégebbi</SelectItem>
                <SelectItem value='popular'>Legnépszerűbb</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Comment Form */}
      <CommentForm
        postId={postId}
        onSubmit={handleCommentSubmit}
        placeholder='Mit gondolsz erről a postról?'
      />

      {/* Comments List */}
      <div className='space-y-4'>
        {comments.map(comment => (
          <div key={comment.id} className='space-y-4'>
            {/* Main Comment */}
            {editingComment?.id === comment.id ? (
              <CommentForm
                editingComment={editingComment}
                onSubmit={handleCommentSubmit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <CommentCard
                comment={comment}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
                onReply={handleReply}
                onEdit={handleEdit}
                showReplies={comment.showReplies}
                onToggleReplies={() => handleToggleReplies(comment.id)}
              />
            )}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                onSubmit={handleCommentSubmit}
                onCancel={handleCancelReply}
                placeholder={`Válaszolj ${comment.user.username} kommentjére...`}
              />
            )}

            {/* Replies */}
            {comment.showReplies && comment.replies && comment.replies.length > 0 && (
              <div className='space-y-3'>
                {comment.replies.map(reply => (
                  <div key={reply.id}>
                    {editingComment?.id === reply.id ? (
                      <CommentForm
                        editingComment={editingComment}
                        onSubmit={handleCommentSubmit}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <CommentCard
                        comment={reply}
                        onUpdate={handleCommentUpdate}
                        onDelete={handleCommentDelete}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        isReply={true}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Loading Replies */}
            {comment.repliesLoading && (
              <div className='ml-6 flex items-center gap-2 text-sm text-gray-500'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Válaszok betöltése...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className='flex justify-center'>
          <Button
            variant='outline'
            onClick={handleLoadMore}
            disabled={isLoading}
            className='flex items-center gap-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Betöltés...
              </>
            ) : (
              <>
                <ChevronDown className='h-4 w-4' />
                További kommentek betöltése
              </>
            )}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && comments.length === 0 && (
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-gray-500'>
              <MessageSquare className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>Még nincsenek kommentek</p>
              <p>Légy az első, aki kommentál erre a posztra!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
