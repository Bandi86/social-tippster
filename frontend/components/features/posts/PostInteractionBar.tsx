'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { MessageCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import PostBookmarkButton from './PostBookmarkButton';
import PostVoteButtons from './PostVoteButtons';
import ReportButton from './ReportButton';

interface PostInteractionBarProps {
  post: {
    id: string;
    user_vote?: 'like' | 'dislike' | null;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
    bookmarks_count: number;
    shares_count: number;
    user_bookmarked?: boolean;
  };
  isAuthenticated: boolean;
  onPostUpdate?: (updatedData: Partial<PostInteractionBarProps['post']>) => void;
  className?: string;
}

/**
 * Magyar: Poszt interakciós sáv komponens
 * Post interaction bar component - contains vote, comment, bookmark, share buttons
 */
export default function PostInteractionBar({
  post,
  isAuthenticated,
  onPostUpdate,
  className,
}: PostInteractionBarProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { sharePost } = usePosts();

  const handleShare = async (platform?: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A megosztáshoz be kell jelentkezni',
        variant: 'destructive',
      });
      return;
    }

    if (isSharing) return;
    setIsSharing(true);

    try {
      await sharePost(post.id, platform);
      onPostUpdate?.({
        shares_count: post.shares_count + 1,
      });

      toast({
        title: 'Sikeres',
        description: 'Poszt megosztva',
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Hiba',
        description: 'A megosztás sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-between pt-4 border-t border-gray-700/50 ${className || ''}`}
    >
      <div className='flex items-center gap-1'>
        {/* Szavazó gombok */}
        <PostVoteButtons
          postId={post.id}
          userVote={post.user_vote ?? null}
          likesCount={post.likes_count}
          dislikesCount={post.dislikes_count}
          isAuthenticated={isAuthenticated}
          onVoteUpdate={onPostUpdate}
        />

        {/* Kommentek */}
        {isAuthenticated ? (
          <Link href={`/posts/${post.id}#comments`}>
            <Button
              variant='ghost'
              size='sm'
              className='h-9 px-3 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200'
            >
              <MessageCircle className='h-4 w-4' />
              <span className='ml-1.5 text-xs font-medium'>{post.comments_count}</span>
            </Button>
          </Link>
        ) : (
          <div className='flex items-center gap-1.5 text-gray-500 px-3 py-2 rounded-lg bg-gray-800/30'>
            <MessageCircle className='h-4 w-4' />
            <span className='text-xs font-medium'>{post.comments_count}</span>
          </div>
        )}

        {/* Könyvjelző */}
        <PostBookmarkButton
          postId={post.id}
          userBookmarked={post.user_bookmarked || false}
          bookmarksCount={post.bookmarks_count}
          isAuthenticated={isAuthenticated}
          onBookmarkUpdate={onPostUpdate}
          className='h-9 px-3 rounded-lg transition-all duration-200'
        />
      </div>

      {/* Jobb oldal: Megosztás és Jelentés */}
      <div className='flex items-center gap-2'>
        {/* Megosztás */}
        {isAuthenticated ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleShare()}
            disabled={isSharing}
            className='h-9 px-3 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200'
          >
            <Share2 className='h-4 w-4' />
            <span className='ml-1.5 text-xs font-medium'>{post.shares_count}</span>
          </Button>
        ) : (
          <div className='flex items-center gap-1.5 text-gray-500 px-3 py-2 rounded-lg bg-gray-800/30'>
            <Share2 className='h-4 w-4' />
            <span className='text-xs font-medium'>{post.shares_count}</span>
          </div>
        )}

        {/* Jelentés */}
        <ReportButton
          postId={post.id}
          onReported={() => {
            toast({
              title: 'Jelentés elküldve',
              description: 'Köszönjük a jelentését.',
            });
          }}
        />
      </div>
    </div>
  );
}
