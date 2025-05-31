'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { requireAuth } from '@/lib/auth-utils';
import { Heart, HeartOff } from 'lucide-react';
import { useState } from 'react';

interface PostVoteButtonsProps {
  postId: string;
  userVote: 'like' | 'dislike' | null;
  likesCount: number;
  dislikesCount: number;
  isAuthenticated: boolean;
  onVoteUpdate?: (updatedData: {
    user_vote: 'like' | 'dislike' | null;
    likes_count: number;
    dislikes_count: number;
  }) => void;
  className?: string;
}

/**
 * Magyar: Post szavazó gombok komponens
 * Post vote buttons component - handles like/dislike functionality
 */
export default function PostVoteButtons({
  postId,
  userVote,
  likesCount,
  dislikesCount,
  isAuthenticated,
  onVoteUpdate,
  className,
}: PostVoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { voteOnPost, removeVoteFromPost } = usePosts();

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!requireAuth(isAuthenticated, 'vote')) return;
    if (isVoting) return;

    setIsVoting(true);

    try {
      if (userVote === type) {
        // Magyar: Szavazat eltávolítása, ha ugyanaz a típus
        await removeVoteFromPost(postId);
        onVoteUpdate?.({
          user_vote: null,
          likes_count: type === 'like' ? likesCount - 1 : likesCount,
          dislikes_count: type === 'dislike' ? dislikesCount - 1 : dislikesCount,
        });
      } else {
        // Magyar: Új szavazat hozzáadása
        await voteOnPost(postId, type);
        const likesChange = type === 'like' ? 1 : userVote === 'like' ? -1 : 0;
        const dislikesChange = type === 'dislike' ? 1 : userVote === 'dislike' ? -1 : 0;

        onVoteUpdate?.({
          user_vote: type,
          likes_count: likesCount + likesChange,
          dislikes_count: dislikesCount + dislikesChange,
        });
      }

      toast({
        title: 'Sikeres',
        description: 'Szavazat rögzítve',
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: 'Hiba',
        description: 'A szavazás sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  // Magyar: Nem bejelentkezett felhasználóknak
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-1 ${className || ''}`}>
        <div className='flex items-center gap-1 text-gray-500 px-2 py-1'>
          <Heart className='h-4 w-4' />
          <span className='ml-1'>{likesCount}</span>
        </div>
        <div className='flex items-center gap-1 text-gray-500 px-2 py-1'>
          <HeartOff className='h-4 w-4' />
          <span className='ml-1'>{dislikesCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleVote('like')}
        disabled={isVoting}
        className={`h-8 px-2 ${
          userVote === 'like'
            ? 'text-green-400 bg-green-500/20'
            : 'text-gray-400 hover:text-green-400'
        }`}
      >
        <Heart className='h-4 w-4' />
        <span className='ml-1'>{likesCount}</span>
      </Button>

      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleVote('dislike')}
        disabled={isVoting}
        className={`h-8 px-2 ${
          userVote === 'dislike' ? 'text-red-400 bg-red-500/20' : 'text-gray-400 hover:text-red-400'
        }`}
      >
        <HeartOff className='h-4 w-4' />
        <span className='ml-1'>{dislikesCount}</span>
      </Button>
    </div>
  );
}
