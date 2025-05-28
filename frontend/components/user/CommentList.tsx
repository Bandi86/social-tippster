'use client';

import { ChevronDown, Loader2, MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
import { Comment, CommentsResponse, fetchCommentReplies, fetchComments } from '@/lib/api/comments';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';

interface CommentListProps {
  postId: string;
  className?: string;
}

interface CommentWithReplies extends Comment {
  replies?: Comment[];
  showReplies?: boolean;
  repliesLoading?: boolean;
}

export default function CommentList({ postId, className }: CommentListProps) {
  const { isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const limit = 10;

  const loadComments = useCallback(
    async (pageNum: number = 1, reset: boolean = true) => {
      try {
        setLoading(pageNum === 1);

        const response: CommentsResponse = await fetchComments({
          postId,
          page: pageNum,
          limit,
          sortBy,
        });

        const commentsWithReplies: CommentWithReplies[] = response.comments.map(comment => ({
          ...comment,
          replies: [],
          showReplies: false,
          repliesLoading: false,
        }));

        if (reset) {
          setComments(commentsWithReplies);
        } else {
          setComments(prev => [...prev, ...commentsWithReplies]);
        }

        setPage(pageNum);
        setTotal(response.total);
        setHasMore(pageNum < response.totalPages);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({
          title: 'Hiba történt',
          description: 'Nem sikerült betölteni a kommenteket.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [postId, sortBy],
  );

  useEffect(() => {
    loadComments(1, true);
  }, [loadComments]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadComments(page + 1, false);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as 'newest' | 'oldest' | 'popular');
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
          const repliesResponse = await fetchCommentReplies(commentId, { page: 1, limit: 50 });
          setComments(prev =>
            prev.map(c =>
              c.id === commentId
                ? {
                    ...c,
                    replies: repliesResponse.comments,
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

  if (loading && comments.length === 0) {
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
            disabled={loading}
            className='flex items-center gap-2'
          >
            {loading ? (
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
      {!loading && comments.length === 0 && (
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
