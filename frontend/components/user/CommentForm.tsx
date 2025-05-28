'use client';

import { Send, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  createComment,
  updateComment,
} from '@/lib/api/comments';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

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
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState(editingComment?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

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
          ? 'Nem sikerült frissíteni a kommentet.'
          : 'Nem sikerült elküldeni a kommentet.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setContent(editingComment?.content || '');
    } else {
      setContent('');
    }
    onCancel?.();
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <Card className={cn('bg-gray-50', className)}>
        <CardContent className='p-4'>
          <div className='text-center text-gray-600'>
            <p className='mb-2'>Kommentáláshoz be kell jelentkezned</p>
            <Button variant='outline' size='sm'>
              Bejelentkezés
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200', isReply && 'ml-6', className)}>
      <CardContent className='p-4'>
        <form onSubmit={handleSubmit}>
          <div className='flex gap-3'>
            {/* Avatar */}
            <Avatar className='h-8 w-8 flex-shrink-0'>
              <AvatarImage src='' alt={user?.username} />
              <AvatarFallback className='text-xs'>
                {user ? getUserInitials(user.username) : 'U'}
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
