'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PostListLoadMoreProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

/**
 * Magyar: PostList további betöltés gomb komponens
 * Handles loading more posts functionality
 */
export default function PostListLoadMore({
  hasMore,
  isLoadingMore,
  onLoadMore,
}: PostListLoadMoreProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className='flex justify-center'>
      <Button
        variant='outline'
        onClick={onLoadMore}
        disabled={isLoadingMore}
        className='border-amber-600 text-amber-400 hover:bg-amber-900/50 rounded-lg shadow-md'
      >
        {isLoadingMore ? (
          <>
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            Betöltés...
          </>
        ) : (
          'További posztok betöltése'
        )}
      </Button>
    </div>
  );
}
