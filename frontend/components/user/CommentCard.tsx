'use client';

import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Flag,
  Heart,
  HeartOff,
  MessageCircle,
  MoreVertical,
  Reply,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useComments } from '@/hooks/useComments';
import { cn } from '@/lib/utils';
import type { Comment } from '@/store/comments';

interface CommentCardProps {
  comment: Comment;
  onUpdate: (updatedComment: Comment) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentCommentId: string) => void;
  onEdit: (comment: Comment) => void;
  isReply?: boolean;
  showReplies?: boolean;
  onToggleReplies?: () => void;
  className?: string;
}

export default function CommentCard({
  comment,
  onUpdate,
  onDelete,
  onReply,
  onEdit,
  isReply = false,
  showReplies = false,
  onToggleReplies,
  className,
}: CommentCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { voteOnComment, deleteComment, reportComment } = useComments();
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === comment.user.id;

  const handleVote = async (voteType: 1 | -1) => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A szavazáshoz be kell jelentkezned.',
        variant: 'destructive',
      });
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      await voteOnComment(comment.id, voteType);

      // Update the comment locally with new vote counts
      const updatedComment = {
        ...comment,
        userVote: voteType,
        upvotes: voteType === 1 ? comment.upvotes + 1 : comment.upvotes,
        downvotes: voteType === -1 ? comment.downvotes + 1 : comment.downvotes,
      };
      onUpdate(updatedComment);

      toast({
        title: 'Szavazat leadva',
        description: voteType === 1 ? 'Pozitív szavazat leadva.' : 'Negatív szavazat leadva.',
      });
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült leadni a szavazatot.',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm('Biztosan törölni szeretnéd ezt a kommentet?');
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteComment(comment.id);
      onDelete(comment.id);

      toast({
        title: 'Komment törölve',
        description: 'A komment sikeresen törölve lett.',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült törölni a kommentet.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A jelentéshez be kell jelentkezned.',
        variant: 'destructive',
      });
      return;
    }

    const reason = window.prompt('Mi a jelentés oka?');
    if (!reason) return;

    try {
      await reportComment(comment.id, reason);

      toast({
        title: 'Jelentés elküldve',
        description: 'Köszönjük a jelentést, hamarosan feldolgozzuk.',
      });
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült elküldeni a jelentést.',
        variant: 'destructive',
      });
    }
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const netVotes = comment.upvotes - comment.downvotes;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isReply && 'ml-6 border-l-2 border-l-blue-200',
        className,
      )}
    >
      <CardContent className='p-4'>
        <div className='flex gap-3'>
          {/* Avatar */}
          <Avatar className='h-8 w-8 flex-shrink-0'>
            <AvatarImage src='' alt={comment.user.username} />
            <AvatarFallback className='text-xs'>
              {getUserInitials(comment.user.username)}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 min-w-0'>
            {/* Header */}
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='font-medium text-gray-900'>{comment.user.username}</span>
                <span className='text-gray-500'>
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: hu,
                  })}
                </span>
                {comment.createdAt !== comment.updatedAt && (
                  <span className='text-gray-400 text-xs'>(szerkesztve)</span>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(comment)}>
                        <Edit className='mr-2 h-4 w-4' />
                        Szerkesztés
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className='text-red-600'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Törlés
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem onClick={handleReport}>
                      <Flag className='mr-2 h-4 w-4' />
                      Jelentés
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className='prose prose-sm max-w-none mb-3'>
              <p className='text-gray-900 whitespace-pre-wrap break-words'>{comment.content}</p>
            </div>

            {/* Actions Bar */}
            <div className='flex items-center gap-4 text-sm'>
              {/* Voting */}
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleVote(1)}
                  disabled={isVoting || !isAuthenticated}
                  className={cn('h-8 px-2', comment.userVote === 1 && 'text-red-600 bg-red-50')}
                >
                  <Heart className={cn('h-4 w-4', comment.userVote === 1 && 'fill-current')} />
                </Button>

                <span
                  className={cn(
                    'px-2 font-medium',
                    netVotes > 0 && 'text-green-600',
                    netVotes < 0 && 'text-red-600',
                    netVotes === 0 && 'text-gray-500',
                  )}
                >
                  {netVotes}
                </span>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleVote(-1)}
                  disabled={isVoting || !isAuthenticated}
                  className={cn('h-8 px-2', comment.userVote === -1 && 'text-blue-600 bg-blue-50')}
                >
                  <HeartOff className={cn('h-4 w-4', comment.userVote === -1 && 'fill-current')} />
                </Button>
              </div>

              {/* Reply Button */}
              {!isReply && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onReply(comment.id)}
                  disabled={!isAuthenticated}
                  className='h-8 px-2'
                >
                  <Reply className='h-4 w-4 mr-1' />
                  Válasz
                </Button>
              )}

              {/* Replies Toggle */}
              {!isReply && comment.replyCount > 0 && onToggleReplies && (
                <Button variant='ghost' size='sm' onClick={onToggleReplies} className='h-8 px-2'>
                  <MessageCircle className='h-4 w-4 mr-1' />
                  {comment.replyCount} válasz
                  {showReplies ? (
                    <ChevronUp className='h-4 w-4 ml-1' />
                  ) : (
                    <ChevronDown className='h-4 w-4 ml-1' />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
