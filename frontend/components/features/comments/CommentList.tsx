'use client';

import { ChevronDown, Loader2, MessageSquare, RefreshCcw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

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
  // Magyar: Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
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

  // Magyar: Rendezési mód állapota
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Magyar: Lekérdezett kommentek az adott poszthoz
  const postComments = commentsByPost[postId] || [];

  // Magyar: Kommentek betöltése (mount, postId, sortBy, page változásakor)
  useEffect(() => {
    setPage(1);
    fetchComments(postId, { page: 1, limit: 10, sortBy })
      .catch(() => {
        // Hibakezelés toast-ban
        toast({
          title: 'Hiba történt',
          description: 'Nem sikerült betölteni a kommenteket.',
          variant: 'destructive',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, sortBy]);

  // Magyar: Kommentek frissítése a store-ból
  useEffect(() => {
    const commentsWithReplies: CommentWithReplies[] = postComments.map(comment => ({
      ...comment,
      showReplies: false,
      repliesLoading: false,
    }));
    setComments(commentsWithReplies);
    setTotal(postComments.length);
    setHasMore(postComments.length >= 10); // Egyszerűsített logika
  }, [postComments]);

  // Magyar: Végtelen ciklus javítása - Eltávolítva a hibás useEffect!
  // useEffect(() => {
  //   setSortBy('newest');
  // }, [sortBy]);

  // Magyar: További kommentek betöltése
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(postId, { page: nextPage, limit: 10, sortBy })
        .then((result: any) => {
          // Magyar: Ha nincs több komment, állítsuk be a hasMore-t
          if (!result || (result.comments && result.comments.length < 10)) {
            setHasMore(false);
          }
        })
        .catch(() => {
          toast({
            title: 'Hiba történt',
            description: 'Nem sikerült további kommenteket betölteni.',
            variant: 'destructive',
          });
        });
    }
  }, [isLoading, hasMore, page, fetchComments, postId, sortBy]);

  // Magyar: Rendezés kezelése
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as 'newest' | 'oldest' | 'popular');
    setPage(1);
    setComments([]);
    setHasMore(true);
  };

  // Magyar: Komment beküldése
  const handleCommentSubmit = (newComment: Comment) => {
    if (editingComment) {
      setComments(prev =>
        prev.map(comment =>
          comment.id === newComment.id
            ? { ...newComment, replies: comment.replies, showReplies: comment.showReplies }
            : comment,
        ),
      );
      setEditingComment(null);
    } else if (replyingTo) {
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
      const commentWithReplies: CommentWithReplies = {
        ...newComment,
        replies: [],
        showReplies: false,
        repliesLoading: false,
      };
      setComments(prev => [commentWithReplies, ...prev]);
      setTotal(prev => prev + 1);
    }
    toast({
      title: 'Sikeres művelet',
      description: 'A komment elküldve.',
      variant: 'default',
    });
  };

  // Magyar: Komment frissítése
  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        }
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply =>
            reply.id === updatedComment.id ? updatedComment : reply,
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      }),
    );
    toast({
      title: 'Komment frissítve',
      description: 'A komment sikeresen frissítve lett.',
      variant: 'default',
    });
  };

  // Magyar: Komment törlése
  const handleCommentDelete = (commentId: string) => {
    setComments(prev => {
      let filtered = prev.filter(comment => comment.id !== commentId);
      filtered = filtered.map(comment => ({
        ...comment,
        replies: comment.replies?.filter(reply => reply.id !== commentId) || [],
      }));
      return filtered;
    });
    setTotal(prev => prev - 1);
    toast({
      title: 'Komment törölve',
      description: 'A komment sikeresen törölve lett.',
      variant: 'default',
    });
  };

  // Magyar: Válaszolás kezelése
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

  // Magyar: Szerkesztés kezelése
  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  // Magyar: Válasz szerkesztésének megszakítása
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Magyar: Szerkesztés megszakítása
  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  // Magyar: Válaszok megjelenítése/elrejtése
  const handleToggleReplies = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (comment.showReplies) {
      setComments(prev => prev.map(c => (c.id === commentId ? { ...c, showReplies: false } : c)));
    } else {
      if (!comment.replies || comment.replies.length === 0) {
        setComments(prev =>
          prev.map(c => (c.id === commentId ? { ...c, repliesLoading: true } : c)),
        );
        try {
          await fetchComments(postId, { parentCommentId: commentId, page: 1, limit: 50 });
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
        setComments(prev => prev.map(c => (c.id === commentId ? { ...c, showReplies: true } : c)));
      }
    }
  };

  // Magyar: Frissítés gomb
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchComments(postId, { page: 1, limit: 10, sortBy });
      toast({
        title: 'Kommentek frissítve',
        description: 'A kommentek listája frissült.',
        variant: 'default',
      });
    } catch {
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült frissíteni a kommenteket.',
        variant: 'destructive',
      });
    }
    setIsRefreshing(false);
  };

  // Magyar: Betöltési skeleton
  if (isLoading && comments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Kommentek betöltése...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Magyar: Hibaállapot
  if (error) {
    return (
      <Card className={className}>
        <CardContent className='p-6'>
          <div className='flex flex-col items-center justify-center gap-3 text-center text-red-500'>
            <MessageSquare className='h-10 w-10 opacity-60' />
            <p className='text-lg font-semibold'>Hiba történt a kommentek betöltésekor</p>
            <p className='text-sm text-red-400'>{typeof error === 'string' ? error : 'Ismeretlen hiba.'}</p>
            <Button
              variant='outline'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='mt-2 flex items-center gap-2'
            >
              <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} />
              Újra próbálom
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Magyar: Fejléc, rendező és frissítő gomb */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between gap-2 flex-wrap'>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Kommentek <span className='text-gray-400'>({total})</span>
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className='w-40 bg-gray-800 border-gray-600 text-white rounded-lg'>
                  <SelectValue placeholder='Rendezés' />
                </SelectTrigger>
                <SelectContent className='bg-gray-800 border-gray-600'>
                  <SelectItem value='newest'>Legújabb</SelectItem>
                  <SelectItem value='oldest'>Legrégebbi</SelectItem>
                  <SelectItem value='popular'>Legnépszerűbb</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='ml-2'
                aria-label='Frissítés'
              >
                <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Magyar: Komment beküldő űrlap */}
      <CommentForm
        postId={postId}
        onSubmit={handleCommentSubmit}
        placeholder='Mit gondolsz erről a posztról?'
      />

      {/* Magyar: Kommentek listája */}
      <div className='space-y-4'>
        {comments.map(comment => (
          <div key={comment.id} className='space-y-4'>
            {/* Magyar: Fő komment */}
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

            {/* Magyar: Válasz űrlap */}
            {replyingTo === comment.id && (
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                onSubmit={handleCommentSubmit}
                onCancel={handleCancelReply}
                placeholder={`Válaszolj ${comment.user.username} kommentjére...`}
              />
            )}

            {/* Magyar: Válaszok */}
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

            {/* Magyar: Válaszok betöltése */}
            {comment.repliesLoading && (
              <div className='ml-6 flex items-center gap-2 text-sm text-gray-500'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Válaszok betöltése...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Magyar: További kommentek betöltése gomb */}
      {hasMore && comments.length > 0 && (
        <div className='flex justify-center'>
          <Button
            variant='outline'
            onClick={handleLoadMore}
            disabled={isLoading}
            className='flex items-center gap-2 border-amber-600 text-amber-400 hover:bg-amber-900/50 rounded-lg shadow-md'
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

      {/* Magyar: Üres állapot */}
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
