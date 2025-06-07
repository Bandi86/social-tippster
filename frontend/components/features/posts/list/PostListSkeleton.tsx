'use client';

import { Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface PostListSkeletonProps {
  count?: number;
}

/**
 * Magyar: PostList betöltési skeleton komponens
 * Shows loading placeholders while posts are being fetched
 */
export default function PostListSkeleton({ count = 4 }: PostListSkeletonProps) {
  return (
    <div className='flex flex-col gap-4 py-12'>
      {[...Array(count)].map((_, i) => (
        <Card key={`skeleton-${i}`} className='bg-gray-800 border-gray-700'>
          <CardContent className='p-6'>
            <div className='animate-pulse space-y-4'>
              <div className='h-4 bg-gray-700 rounded w-3/4'></div>
              <div className='h-3 bg-gray-700 rounded w-1/2'></div>
              <div className='h-20 bg-gray-700 rounded'></div>
              <div className='flex gap-4'>
                <div className='h-3 bg-gray-700 rounded w-16'></div>
                <div className='h-3 bg-gray-700 rounded w-16'></div>
                <div className='h-3 bg-gray-700 rounded w-16'></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className='flex justify-center'>
        <div className='flex items-center gap-2 text-gray-400'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Posztok betöltése...</span>
        </div>
      </div>
    </div>
  );
}
