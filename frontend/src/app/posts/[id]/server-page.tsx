import ServerNavbar from '@/components/layout/server-navbar';
import { Button } from '@/components/ui/button';
import { ServerPostsService } from '@/features/posts/server-posts-service';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const post = await ServerPostsService.getPostById(params.id);

    return {
      title: `${post.title} - Social Tippster`,
      description: post.content.substring(0, 160) + (post.content.length > 160 ? '...' : ''),
      openGraph: {
        title: post.title,
        description: post.content.substring(0, 160) + (post.content.length > 160 ? '...' : ''),
        type: 'article',
        authors: [post.author.name],
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
      },
      twitter: {
        card: 'summary',
        title: post.title,
        description: post.content.substring(0, 160) + (post.content.length > 160 ? '...' : ''),
      },
    };
  } catch (error) {
    return {
      title: 'Post Not Found - Social Tippster',
      description: 'The requested post could not be found.',
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const post = await ServerPostsService.getPostById(params.id);

    return (
      <div className='flex flex-col min-h-screen'>
        <ServerNavbar />

        <main className='flex-grow'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            {/* Breadcrumb */}
            <nav className='flex items-center space-x-2 text-sm text-gray-500 mb-8'>
              <Link href='/' className='hover:text-gray-700'>
                Home
              </Link>
              <span>/</span>
              <Link href='/posts' className='hover:text-gray-700'>
                Posts
              </Link>
              <span>/</span>
              <span className='text-gray-900 truncate'>{post.title}</span>
            </nav>

            <article className='bg-white rounded-lg shadow-sm border overflow-hidden'>
              {/* Header */}
              <div className='p-6 border-b'>
                <h1 className='text-3xl font-bold text-gray-900 mb-4'>{post.title}</h1>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-blue-600 font-semibold'>
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>{post.author.name}</p>
                      <p className='text-sm text-gray-500'>{formatDate(post.createdAt)}</p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Link href='/posts'>
                      <Button variant='outline' size='sm'>
                        ← Back to Posts
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className='p-6'>
                <div className='prose max-w-none'>
                  <p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className='px-6 py-4 bg-gray-50 border-t'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm text-gray-500'>
                    {post.updatedAt !== post.createdAt && (
                      <span>Last updated: {formatDate(post.updatedAt)}</span>
                    )}
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Button variant='outline' size='sm'>
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Actions */}
            <div className='mt-8 flex flex-col sm:flex-row gap-4'>
              <Link href='/posts/new'>
                <Button className='w-full sm:w-auto'>Create Your Own Post</Button>
              </Link>
              <Link href='/posts'>
                <Button variant='outline' className='w-full sm:w-auto'>
                  Browse More Posts
                </Button>
              </Link>
            </div>
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
  } catch (error) {
    console.error('Failed to fetch post:', error);
    notFound();
  }
}
