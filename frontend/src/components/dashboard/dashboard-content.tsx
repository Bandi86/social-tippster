'use client';

import { Button } from '@/components/ui/button';
import { PostsService } from '@/features/posts/posts-service';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense } from 'react';

function DashboardStats() {
  const { data: postsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => PostsService.getPosts({ limit: 1 }),
  });

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>Total Posts</p>
            <p className='text-2xl font-bold text-gray-900'>{postsData?.meta?.totalItems || 0}</p>
          </div>
          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-5 h-5 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>Community Members</p>
            <p className='text-2xl font-bold text-gray-900'>1,234</p>
          </div>
          <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-5 h-5 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>Your Posts</p>
            <p className='text-2xl font-bold text-gray-900'>12</p>
          </div>
          <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-5 h-5 text-purple-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentPosts() {
  const {
    data: postsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts', { limit: 5 }],
    queryFn: () => PostsService.getPosts({ limit: 5, order: 'DESC' }),
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='border rounded-lg p-4 animate-pulse'>
            <div className='h-5 bg-gray-200 rounded w-3/4 mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2 mb-3'></div>
            <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8 text-red-600'>
        <p>Failed to load recent posts</p>
      </div>
    );
  }

  if (!postsData?.data || postsData.data.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <p>No posts found</p>
        <Link href='/posts/new'>
          <Button className='mt-4'>Create Your First Post</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {postsData.data.map(post => (
        <div key={post.id} className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
          <Link href={`/posts/${post.id}`}>
            <h3 className='font-medium text-lg hover:text-blue-600 mb-1'>{post.title}</h3>
          </Link>
          <p className='text-gray-500 text-sm mb-2'>
            By {post.author.name} • {formatDate(post.createdAt)}
          </p>
          <p className='text-gray-700 line-clamp-2'>{post.content}</p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className='space-y-8'>
      <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm text-white p-6'>
        <h1 className='text-2xl font-bold mb-2'>Welcome back, {user?.name}!</h1>
        <p className='text-blue-100'>
          Ready to share your knowledge or discover new insights from the community?
        </p>
      </div>

      <Suspense fallback={<div className='animate-pulse bg-gray-200 h-32 rounded-lg'></div>}>
        <DashboardStats />
      </Suspense>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='bg-white rounded-lg shadow-sm border'>
          <div className='p-6 border-b'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Recent Posts</h2>
              <Link href='/posts'>
                <Button variant='outline' size='sm'>
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className='p-6'>
            <Suspense fallback={<div className='animate-pulse bg-gray-200 h-32 rounded'></div>}>
              <RecentPosts />
            </Suspense>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border'>
          <div className='p-6 border-b'>
            <h2 className='text-xl font-semibold'>Quick Actions</h2>
          </div>
          <div className='p-6 space-y-4'>
            <Link href='/posts/new'>
              <Button className='w-full justify-start h-auto py-4 px-6'>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  <div className='text-left'>
                    <div className='font-medium'>Create New Post</div>
                    <div className='text-sm opacity-75'>Share your tips with the community</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href='/profile'>
              <Button variant='outline' className='w-full justify-start h-auto py-4 px-6'>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  <div className='text-left'>
                    <div className='font-medium'>Edit Profile</div>
                    <div className='text-sm text-gray-500'>Update your personal information</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href='/posts'>
              <Button variant='outline' className='w-full justify-start h-auto py-4 px-6'>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                  <div className='text-left'>
                    <div className='font-medium'>Browse Posts</div>
                    <div className='text-sm text-gray-500'>Discover new insights and tips</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
