'use client';

import AuthGuard from '@/components/auth/auth-guard';
import BaseLayout from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import { PostsService } from '@/features/posts/posts-service';
import { formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: postsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts', { page, limit }],
    queryFn: () => PostsService.getPosts({ page, limit, order: 'DESC' }),
  });

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (postsData && postsData.meta.page < postsData.meta.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <AuthGuard>
      <BaseLayout>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>Latest Posts</h1>
            <Link href='/posts/new'>
              <Button>Create New Post</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className='flex justify-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
            </div>
          ) : error ? (
            <div className='bg-red-50 text-red-500 p-4 rounded-md'>
              An error occurred while fetching posts. Please try again.
            </div>
          ) : postsData?.data && postsData.data.length > 0 ? (
            <>
              <div className='space-y-6'>
                {postsData.data.map(post => (
                  <div key={post.id} className='bg-white p-6 rounded-lg shadow-sm'>
                    <Link href={`/posts/${post.id}`}>
                      <h2 className='text-xl font-semibold hover:text-blue-600 transition-colors'>
                        {post.title}
                      </h2>
                    </Link>
                    <div className='flex items-center text-gray-500 text-sm mt-2'>
                      <span>By {post.author.name}</span>
                      <span className='mx-2'>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <p className='mt-4 text-gray-700 line-clamp-3'>{post.content}</p>
                    <div className='mt-4'>
                      <Link href={`/posts/${post.id}`}>
                        <Button variant='outline' size='sm'>
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {postsData.meta.totalPages > 1 && (
                <div className='flex items-center justify-between mt-8'>
                  <Button variant='outline' onClick={handlePreviousPage} disabled={page === 1}>
                    Previous
                  </Button>
                  <span className='text-sm text-gray-500'>
                    Page {page} of {postsData.meta.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    onClick={handleNextPage}
                    disabled={page === postsData.meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className='bg-white p-12 rounded-lg shadow-sm text-center'>
              <h3 className='text-xl font-medium text-gray-700 mb-4'>No posts found</h3>
              <p className='text-gray-500 mb-6'>
                Be the first to create a post and share your tips!
              </p>
              <Link href='/posts/new'>
                <Button>Create Your First Post</Button>
              </Link>
            </div>
          )}
        </div>
      </BaseLayout>
    </AuthGuard>
  );
}
