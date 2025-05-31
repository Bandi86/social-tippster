'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { requireAuth } from '@/lib/auth-utils';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';

interface PostBookmarkButtonProps {
  postId: string;
  userBookmarked: boolean;
  bookmarksCount: number;
  isAuthenticated: boolean;
  onBookmarkUpdate?: (updatedData: { user_bookmarked: boolean; bookmarks_count: number }) => void;
  className?: string;
}

/**
 * Magyar: Post könyvjelző gomb komponens
 * Post bookmark button component - handles bookmark functionality
 */
export default function PostBookmarkButton({
  postId,
  userBookmarked,
  bookmarksCount,
  isAuthenticated,
  onBookmarkUpdate,
  className,
}: PostBookmarkButtonProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { toggleBookmark } = usePosts();

  const handleBookmark = async () => {
    if (!requireAuth(isAuthenticated, 'bookmark')) return;
    if (isBookmarking) return;

    setIsBookmarking(true);

    try {
      const result = await toggleBookmark(postId);
      onBookmarkUpdate?.({
        user_bookmarked: result.bookmarked,
        bookmarks_count: result.bookmarked ? bookmarksCount + 1 : bookmarksCount - 1,
      });

      toast({
        title: 'Sikeres',
        description: result.bookmarked ? 'Könyvjelzőkhöz adva' : 'Eltávolítva a könyvjelzőkből',
      });
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: 'Hiba',
        description: 'A könyvjelző műveletek sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  // Magyar: Nem bejelentkezett felhasználóknak
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-1 text-gray-500 px-2 py-1 ${className || ''}`}>
        <Bookmark className='h-4 w-4' />
        <span className='ml-1'>{bookmarksCount}</span>
      </div>
    );
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleBookmark}
      disabled={isBookmarking}
      className={`h-8 px-2 ${
        userBookmarked ? 'text-amber-400 bg-amber-500/20' : 'text-gray-400 hover:text-amber-400'
      } ${className || ''}`}
    >
      {userBookmarked ? <BookmarkCheck className='h-4 w-4' /> : <Bookmark className='h-4 w-4' />}
      <span className='ml-1'>{bookmarksCount}</span>
    </Button>
  );
}
