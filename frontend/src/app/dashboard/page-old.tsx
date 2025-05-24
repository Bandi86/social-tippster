'use client';

import AuthGuard from '@/components/auth/auth-guard';
import BaseLayout from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import { PostsService } from '@/features/posts/posts-service';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts', { limit: 5 }],
    queryFn: () => PostsService.getPosts({ limit: 5, order: 'DESC' }),
  });

  return (
    <AuthGuard>
      <BaseLayout>
        <div className='space-y-8'>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h1 className='text-2xl font-bold'>Welcome back, {user?.name}!</h1>
            <p className='text-gray-600 mt-2'>
              This is your personal dashboard where you can view your recent activity and manage
              your account.
            </p>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold'>Recent Posts</h2>
              <Link href='/posts'>
                <Button variant='outline'>View All Posts</Button>
              </Link>
            </div>

            {isLoadingPosts ? (
              <div className='py-8 flex justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900'></div>
              </div>
            ) : postsData?.data && postsData.data.length > 0 ? (
              <div className='space-y-4'>
                {postsData.data.map(post => (
                  <div
                    key={post.id}
                    className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                  >
                    <Link href={`/posts/${post.id}`}>
                      <h3 className='font-medium text-lg hover:text-blue-600'>{post.title}</h3>
                    </Link>
                    <p className='text-gray-500 text-sm mt-1'>
                      By {post.author.name} • {formatDate(post.createdAt)}
                    </p>
                    <p className='text-gray-700 mt-2 line-clamp-2'>{post.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <p>No posts found</p>
                <Link href='/posts/new'>
                  <Button className='mt-4'>Create Your First Post</Button>
                </Link>
              </div>
            )}
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold mb-4'>Quick Actions</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Link href='/posts/new'>
                <Button variant='outline' className='w-full justify-start h-auto py-4 px-6'>
                  <div className='flex flex-col items-start'>
                    <span className='text-lg font-medium'>Create New Post</span>
                    <span className='text-sm text-gray-500'>
                      Share your tips with the community
                    </span>
                  </div>
                </Button>
              </Link>
              <Link href='/profile'>
                <Button variant='outline' className='w-full justify-start h-auto py-4 px-6'>
                  <div className='flex flex-col items-start'>
                    <span className='text-lg font-medium'>Edit Profile</span>
                    <span className='text-sm text-gray-500'>Update your personal information</span>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </BaseLayout>
    </AuthGuard>
  );
}
