'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Posts page error:', error);
  }, [error]);

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex-grow flex items-center justify-center bg-gray-50'>
        <div className='max-w-md w-full mx-auto text-center p-8'>
          <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg
              className='w-10 h-10 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>

          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Unable to load posts</h1>

          <p className='text-gray-600 mb-8'>
            There was an error loading the posts. This might be a temporary issue.
          </p>

          <div className='space-y-3'>
            <Button onClick={reset} className='w-full'>
              Try again
            </Button>

            <Link href='/'>
              <Button variant='outline' className='w-full'>
                Go back home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
