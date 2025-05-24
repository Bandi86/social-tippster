import ServerNavbar from '@/components/layout/server-navbar';
import { Button } from '@/components/ui/button';
import { ServerPostsService } from '@/features/posts/server-posts-service';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Posts - Social Tippster',
  description: 'Browse and discover tips and insights shared by our community members.',
};

interface PostsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function PostsList({ searchParams }: { searchParams: any }) {
  try {
    const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
    const limit = 10;

    const postsData = await ServerPostsService.getPosts({
      page,
      limit,
      order: 'DESC',
    });

    if (!postsData.data || postsData.data.length === 0) {
      return (
        <div className='text-center py-12'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg
              className='w-10 h-10 text-gray-400'
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
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>No posts found</h3>
          <p className='text-gray-600 mb-6'>Be the first to share your tips with the community!</p>
          <Link href='/posts/new'>
            <Button>Create Your First Post</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        <div className='space-y-6'>
          {postsData.data.map(post => (
            <article
              key={post.id}
              className='bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <Link href={`/posts/${post.id}`}>
                    <h2 className='text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2'>
                      {post.title}
                    </h2>
                  </Link>
                  <div className='flex items-center text-sm text-gray-500 mb-3'>
                    <span>By {post.author.name}</span>
                    <span className='mx-2'>•</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <p className='text-gray-700 line-clamp-3 mb-4'>{post.content}</p>
                  <Link
                    href={`/posts/${post.id}`}
                    className='inline-flex items-center text-blue-600 hover:text-blue-800 font-medium'
                  >
                    Read more
                    <svg
                      className='w-4 h-4 ml-1'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {postsData.meta && postsData.meta.totalPages > 1 && (
          <div className='flex justify-center items-center space-x-4 pt-8'>
            {page > 1 && (
              <Link href={`/posts?page=${page - 1}`}>
                <Button variant='outline'>Previous</Button>
              </Link>
            )}

            <span className='text-sm text-gray-600'>
              Page {page} of {postsData.meta.totalPages}
            </span>

            {page < postsData.meta.totalPages && (
              <Link href={`/posts?page=${page + 1}`}>
                <Button variant='outline'>Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return (
      <div className='text-center py-12'>
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
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>Unable to load posts</h3>
        <p className='text-gray-600'>
          There was an error loading the posts. Please try again later.
        </p>
      </div>
    );
  }
}

function PostsListSkeleton() {
  return (
    <div className='space-y-6'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='bg-white rounded-lg shadow-sm border p-6 animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-3/4 mb-3'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
          <div className='space-y-2 mb-4'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
            <div className='h-4 bg-gray-200 rounded w-4/6'></div>
          </div>
          <div className='h-4 bg-gray-200 rounded w-24'></div>
        </div>
      ))}
    </div>
  );
}

export default function PostsPage({ searchParams }: PostsPageProps) {
  return (
    <div className='flex flex-col min-h-screen'>
      <ServerNavbar />

      <main className='flex-grow'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Community Posts</h1>
              <p className='text-gray-600 mt-2'>
                Discover tips and insights shared by our community members
              </p>
            </div>
            <Link href='/posts/new'>
              <Button>Create Post</Button>
            </Link>
          </div>

          <Suspense fallback={<PostsListSkeleton />}>
            <PostsList searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <footer className='bg-gray-50 py-6 border-t'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <p className='text-center text-gray-500 text-sm'>
            &copy; {new Date().getFullYear()} Social Tippster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
