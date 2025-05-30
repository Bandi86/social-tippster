'use client';

import { Send, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useComments } from '@/hooks/useComments';
import { cn } from '@/lib/utils';
import type { Comment, CreateCommentData, UpdateCommentData } from '@/store/comments';

interface CommentFormProps {
  postId?: string;
  parentCommentId?: string;
  editingComment?: Comment;
  onSubmit: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export default function CommentForm({
  postId,
  parentCommentId,
  editingComment,
  onSubmit,
  onCancel,
  placeholder = 'Írj egy kommentet...',
  className,
}: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const { createComment, updateComment, isSubmitting } = useComments();
  const [content, setContent] = useState(editingComment?.content || '');

  const isEditing = !!editingComment;
  const isReply = !!parentCommentId;

  useEffect(() => {
    if (editingComment) {
      setContent(editingComment.content);
    }
  }, [editingComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A kommentáláshoz be kell jelentkezned.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Hiányzó tartalom',
        description: 'A komment nem lehet üres.',
        variant: 'destructive',
      });
      return;
    }

    if (content.length > 1000) {
      toast({
        title: 'Túl hosszú komment',
        description: 'A komment maximum 1000 karakter lehet.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let comment: Comment;

      if (isEditing && editingComment) {
        const updateData: UpdateCommentData = {
          content: content.trim(),
        };
        comment = await updateComment(editingComment.id, updateData);

        toast({
          title: 'Komment frissítve',
          description: 'A komment sikeresen frissítve lett.',
        });
      } else {
        if (!postId) {
          throw new Error('Post ID is required for creating comments');
        }

        const createData: CreateCommentData = {
          content: content.trim(),
          postId,
          parentCommentId,
        };
        comment = await createComment(createData);

        toast({
          title: 'Komment elküldve',
          description: isReply ? 'A válasz sikeresen elküldve.' : 'A komment sikeresen elküldve.',
        });
      }

      onSubmit(comment);

      if (!isEditing) {
        setContent('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Hiba történt',
        description: isEditing
          ? 'A komment frissítése sikertelen.'
          : 'A komment elküldése sikertelen.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (!isEditing) {
      setContent('');
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className='p-4'>
          <div className='text-center text-gray-600'>
            <p>Kommentáláshoz jelentkezz be.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className='p-4'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex gap-3'>
            {/* User Avatar */}
            <Avatar className='h-8 w-8 flex-shrink-0'>
              <AvatarImage src={user?.profile_image} alt={user?.username} />
              <AvatarFallback className='text-xs'>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className='flex-1 space-y-3'>
              {/* Header for editing */}
              {isEditing && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700'>Komment szerkesztése</span>
                  {onCancel && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={handleCancel}
                      className='h-8 w-8 p-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              )}

              {/* Textarea */}
              <Textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder={placeholder}
                disabled={isSubmitting}
                className='min-h-[80px] resize-none'
                maxLength={1000}
              />

              {/* Character counter and actions */}
              <div className='flex items-center justify-between'>
                <div className='text-xs text-gray-500'>{content.length}/1000 karakter</div>

                <div className='flex items-center gap-2'>
                  {(isEditing || isReply) && onCancel && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Mégse
                    </Button>
                  )}

                  <Button
                    type='submit'
                    size='sm'
                    disabled={isSubmitting || !content.trim()}
                    className='flex items-center gap-2'
                  >
                    <Send className='h-4 w-4' />
                    {isSubmitting
                      ? 'Küldés...'
                      : isEditing
                        ? 'Frissítés'
                        : isReply
                          ? 'Válasz'
                          : 'Komment'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
