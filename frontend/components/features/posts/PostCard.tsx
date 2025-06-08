'use client';

import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import { Crown, Pin } from 'lucide-react'; // Removed Eye
import Link from 'next/link';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/store/posts';

import PostContent from './PostContent';
import PostInteractionBar from './PostInteractionBar';
// Removed PostMetaIndicators import
import PostTypeBadge from './PostTypeBadge';

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Partial<Post>) => void;
  compact?: boolean;
}

/**
 * Magyar: PostCard komponens - refaktorált változat
 * Smaller, more focused component using existing sub-components
 */
export default function PostCard({ post, onPostUpdate, compact = false }: PostCardProps) {
  const { isAuthenticated } = useAuth();
  const { trackPostView } = usePosts();

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
          {/* Author Info Section */}
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10 ring-2 ring-gray-700/50'>
              <AvatarImage
                src={post.author?.profile_image}
                alt={post.author?.username || 'Felhasználó'}
              />
              <AvatarFallback className='bg-amber-600 text-white font-semibold'>
                {post.author?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='flex items-center gap-2'>
                <Link
                  href={`/profile/${post.author?.username}`}
                  className='font-semibold text-white hover:text-amber-400 transition-colors duration-200'
                >
                  {post.author?.username || 'Ismeretlen felhasználó'}
                </Link>

               {/* Removed reputation score and eye icon right now
                 {post.author?.reputation_score && post.author.reputation_score > 100 && (
                  <Crown className='h-4 w-4 text-amber-400' />
                )} */}
                {post.is_pinned && <Pin className='h-4 w-4 text-amber-400' />}
                {post.is_featured && <Crown className='h-4 w-4 text-amber-400' />}
              </div>

              {/* Post Meta Information */}
              <div className='flex items-center gap-2 text-sm text-gray-400'>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: hu })}
                </span>
                {/* View count: only show if > 0, styled nicely */}
                {typeof post.views_count === 'number' && post.views_count > 0 && (
                  <>
                    <span>•</span>
                    <div className='flex items-center gap-1'>
                      {/* Eye icon removed, but you can add it back if desired */}
                      <span className='font-semibold text-amber-300'>{post.views_count}</span>
                      <span className='text-xs text-amber-200'>megtekintés</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Post Type Badge - using existing component */}
          <div className='flex items-center gap-2'>
            <PostTypeBadge type={post.type} />
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
          maxLength={compact ? 80 : 120}
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
