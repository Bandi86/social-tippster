'use client';

import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import CommentList from '@/components/features/comments/CommentList';
import PostAuthorInfo from '@/components/features/posts/PostAuthorInfo';
import PostContent from '@/components/features/posts/PostContent';
import PostInteractionBar from '@/components/features/posts/PostInteractionBar';
import PostTypeBadge from '@/components/features/posts/PostTypeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { cn } from '@/lib/utils';
import { Post } from '@/store/posts';

interface PostDetailPageProps {
  params: { id: string };
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const { currentPost: post, isLoading, error, fetchPostById, trackPostView } = usePosts();

  // Fetch post on mount
  useEffect(() => {
    if (params.id) {
      fetchPostById(params.id);
    }
  }, [params.id, fetchPostById]);

  // Track post view when post is loaded
  useEffect(() => {
    if (post && !isLoading) {
      trackPostView(post.id);
    }
  }, [post, isLoading, trackPostView]);

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950/20 flex items-center justify-center'>
        <div className='flex items-center space-x-2 text-amber-400'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Poszt betöltése...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950/20 flex items-center justify-center'>
        <Card className='w-full max-w-md mx-4 bg-gray-900/50 border-red-500/50'>
          <CardHeader>
            <h2 className='text-xl font-bold text-red-400'>Hiba történt</h2>
          </CardHeader>
          <CardContent>
            <p className='text-gray-300 mb-4'>{error}</p>
            <div className='flex gap-2'>
              <Button onClick={() => router.back()} variant='outline'>
                Vissza
              </Button>
              <Button onClick={() => fetchPostById(params.id)} variant='default'>
                Újrapróbálás
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Post not found
  if (!post) {
    notFound();
  }

  // Determine layout based on content
  const hasComments = post.comments_count > 0;
  const hasImage = !!post.image_url;

  // Layout decision logic
  const getLayoutType = () => {
    if (!hasComments && !hasImage) return 'single'; // 1 panel
    if (hasComments && !hasImage) return 'two-vertical'; // 2 panel: post + comments below
    if (!hasComments && hasImage) return 'two-horizontal'; // 2 panel: post + image to right
    return 'three'; // 3 panel: post left, comments below, image right
  };

  const layoutType = getLayoutType();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950/20'>
      {/* Navigation Header */}
      <div className='sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center gap-4'>
            <Button
              onClick={() => router.back()}
              variant='ghost'
              size='sm'
              className='text-gray-400 hover:text-amber-400'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Vissza
            </Button>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Eye className='h-4 w-4' />
              <span>{post.views_count.toLocaleString()} megtekintés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-6'>
        {/* Single Panel Layout */}
        {layoutType === 'single' && (
          <div className='max-w-4xl mx-auto'>
            <PostCard post={post} isDetailView />
          </div>
        )}

        {/* Two Panel Vertical Layout (Post + Comments) */}
        {layoutType === 'two-vertical' && (
          <div className='max-w-4xl mx-auto space-y-6'>
            <PostCard post={post} isDetailView />
            <CommentList postId={post.id} />
          </div>
        )}

        {/* Two Panel Horizontal Layout (Post + Image) */}
        {layoutType === 'two-horizontal' && (
          <div className='max-w-7xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2'>
                <PostCard post={post} isDetailView />
              </div>
              <div className='lg:col-span-1'>
                <Card className='bg-gray-900/50 border-gray-700/50 overflow-hidden'>
                  <div className='aspect-square relative'>
                    <img
                      src={post.image_url}
                      alt='Poszt kép'
                      className='w-full h-full object-cover'
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Three Panel Layout (Post + Comments + Image) */}
        {layoutType === 'three' && (
          <div className='max-w-7xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
              <div className='lg:col-span-2 space-y-6'>
                <PostCard post={post} isDetailView />
                <CommentList postId={post.id} />
              </div>
              <div className='lg:col-span-2'>
                <Card className='bg-gray-900/50 border-gray-700/50 overflow-hidden sticky top-24'>
                  <div className='aspect-square relative'>
                    <img
                      src={post.image_url}
                      alt='Poszt kép'
                      className='w-full h-full object-cover'
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced PostCard component for detail view
interface PostCardProps {
  post: Post;
  isDetailView?: boolean;
}

function PostCard({ post, isDetailView = false }: PostCardProps) {
  const { isAuthenticated: authStatus } = useAuth();

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50',
        isDetailView && 'shadow-xl',
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <PostTypeBadge type={post.type} />
            {post.is_featured && (
              <div className='flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium'>
                <Eye className='h-3 w-3' />
                Kiemelt
              </div>
            )}
            {post.is_pinned && (
              <div className='flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium'>
                <Eye className='h-3 w-3' />
                Rögzített
              </div>
            )}
          </div>
        </div>

        <PostAuthorInfo
          author={post.author}
          createdAt={post.created_at}
          viewsCount={post.views_count}
        />
      </CardHeader>

      <CardContent className='space-y-4'>
        <PostContent
          title={post.title}
          content={post.content}
          excerpt={post.excerpt}
          postId={post.id}
          maxLength={isDetailView ? 1000 : 120}
          imageUrl={post.image_url}
        />

        {post.tags && post.tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className='px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <Separator className='bg-gray-700/50' />

        <PostInteractionBar post={post} isAuthenticated={authStatus} />
      </CardContent>
    </Card>
  );
}
