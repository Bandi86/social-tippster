'use client';

import { Crown, Pin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/store/posts';

import PostAuthorInfo from './PostAuthorInfo';
import PostContent from './PostContent';
import PostInteractionBar from './PostInteractionBar';
import PostTypeBadge from './PostTypeBadge';

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Partial<Post>) => void;
  compact?: boolean;
  isDetailView?: boolean;
  isAuthenticated?: boolean;
}

/**
 * Magyar: PostCard komponens - refaktorált változat
 * Smaller, more focused component using existing sub-components
 */
export default function PostCard({
  post,
  onPostUpdate,
  compact = false,
  isDetailView = false,
  isAuthenticated: propIsAuthenticated
}: PostCardProps) {
  const { isAuthenticated: hookIsAuthenticated } = useAuth();
  const { trackPostView } = usePosts();

  // Use prop value if provided, otherwise fallback to hook
  const isAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : hookIsAuthenticated;

  // Debug: Log post author data
/*   React.useEffect(() => {
    console.log('PostCard Debug - Post:', post.id, 'Author:', post.author);
    console.log('PostCard Debug - Author username:', post.author?.username);
    console.log('PostCard Debug - Full post data:', post);
  }, [post]); */

  // Handle post view tracking on mount
  React.useEffect(() => {
    trackPostView(post.id);
  }, [post.id, trackPostView]);

  // Handle post updates from sub-components
  const handlePostUpdate = (updates: Partial<Post>) => {
    onPostUpdate?.(updates);
  };

  return (
    <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50 hover:border-amber-600/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-600/10'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          {/* Author Info Section - using PostAuthorInfo component */}
          <PostAuthorInfo
            author={post.author}
            createdAt={post.created_at}
            viewsCount={post.views_count}
          />

          {/* Post Type Badge - using existing component */}
          <div className='flex items-center gap-2'>
            <PostTypeBadge type={post.type} />
            {post.is_pinned && <Pin className='h-4 w-4 text-amber-400' />}
            {post.is_featured && <Crown className='h-4 w-4 text-amber-400' />}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Post Content - using existing component */}
        <PostContent
          title={post.title}
          content={post.content}
          excerpt={post.excerpt}
          postId={post.id}
          imageUrl={post.image_url}
          maxLength={isDetailView ? Infinity : (compact ? 80 : 120)}
          isDetailView={isDetailView}
        />

        {/* Interaction Bar - using existing component */}
        <PostInteractionBar
          post={post}
          isAuthenticated={isAuthenticated}
          onPostUpdate={handlePostUpdate}
          className='pt-4 border-t border-gray-700/50'
        />

        {/* Login Prompt for Guest Users */}
        {!isAuthenticated && (
          <div className='mt-3 p-3 bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-700/30 rounded-lg'>
            <p className='text-sm text-amber-300 text-center'>
              <Link href='/auth' className='hover:text-amber-200 underline underline-offset-2'>
                Jelentkezz be
              </Link>{' '}
              a szavazáshoz, kommenteléshez és könyvjelzőzéshez
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
