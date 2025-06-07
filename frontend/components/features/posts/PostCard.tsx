'use client';

import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import {
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Crown,
  Eye,
  FileText,
  Heart,
  HeartOff,
  MessageCircle,
  MessageSquare,
  Pin,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/store/posts';

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Partial<Post>) => void;
  compact?: boolean;
}

export default function PostCard({ post, onPostUpdate, compact = false }: PostCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { isAuthenticated } = useAuth();
  const { voteOnPost, removeVoteFromPost, toggleBookmark, sharePost, trackPostView } = usePosts();

  // Handle post view tracking on mount
  React.useEffect(() => {
    trackPostView(post.id);
  }, [post.id]);

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A szavazáshoz be kell jelentkezni',
        variant: 'destructive',
      });
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      if (post.user_vote === type) {
        // Remove vote if same type
        await removeVoteFromPost(post.id);
        onPostUpdate?.({
          user_vote: null,
          likes_count: type === 'like' ? post.likes_count - 1 : post.likes_count,
          dislikes_count: type === 'dislike' ? post.dislikes_count - 1 : post.dislikes_count,
        });
      } else {
        // Add new vote
        await voteOnPost(post.id, type);
        const likesChange = type === 'like' ? 1 : post.user_vote === 'like' ? -1 : 0;
        const dislikesChange = type === 'dislike' ? 1 : post.user_vote === 'dislike' ? -1 : 0;

        onPostUpdate?.({
          user_vote: type,
          likes_count: post.likes_count + likesChange,
          dislikes_count: post.dislikes_count + dislikesChange,
        });
      }

      toast({
        title: 'Sikeres',
        description: 'Szavazat rögzítve',
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: 'Hiba',
        description: 'A szavazás sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A könyvjelzőzéshez be kell jelentkezni',
        variant: 'destructive',
      });
      return;
    }

    if (isBookmarking) return;
    setIsBookmarking(true);

    try {
      const result = await toggleBookmark(post.id);
      onPostUpdate?.({
        user_bookmarked: result.bookmarked,
        bookmarks_count: result.bookmarked ? post.bookmarks_count + 1 : post.bookmarks_count - 1,
      });

      toast({
        title: 'Sikeres',
        description: result.bookmarked ? 'Könyvjelzőkhöz adva' : 'Eltávolítva a könyvjelzőkből',
      });
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: 'Hiba',
        description: 'A könyvjelző műveletek sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = async (platform?: string) => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      await sharePost(post.id, platform);
      onPostUpdate?.({
        shares_count: post.shares_count + 1,
      });

      toast({
        title: 'Sikeres',
        description: 'Poszt megosztva',
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Hiba',
        description: 'A megosztás sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <FileText className='h-4 w-4' />;
      case 'discussion':
        return <MessageSquare className='h-4 w-4' />;
      case 'analysis':
        return <BarChart3 className='h-4 w-4' />;
      case 'help_request':
        return <MessageCircle className='h-4 w-4' />;
      case 'news':
        return <FileText className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const variants = {
      general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      discussion: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      analysis: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      help_request: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      news: 'bg-red-500/20 text-red-400 border-red-500/30',
    } as const;

    return (
      <Badge
        variant='outline'
        className={variants[type as keyof typeof variants] || variants.discussion}
      >
        {getPostTypeIcon(type)}
        <span className='ml-1 capitalize'>{type}</span>
      </Badge>
    );
  };

  return (
    <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-amber-600/50 transition-all duration-200'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage
                src={post.author?.profile_image}
                alt={post.author?.username || 'Felhasználó'}
              />
              <AvatarFallback className='bg-amber-600 text-white'>
                {post.author?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='flex items-center gap-2'>
                <Link
                  href={`/profile/${post.author?.username}`}
                  className='font-medium text-white hover:text-amber-400 transition-colors'
                >
                  {post.author?.username || 'Ismeretlen felhasználó'}
                </Link>
                {post.author?.reputation_score && post.author.reputation_score > 100 && (
                  <Crown className='h-4 w-4 text-amber-400' />
                )}
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-400'>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: hu })}
                </span>
                <span>•</span>
                <div className='flex items-center gap-1'>
                  <Eye className='h-3 w-3' />
                  <span>{post.views_count}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {post.is_pinned && <Pin className='h-4 w-4 text-amber-400' />}
            {post.is_featured && <Crown className='h-4 w-4 text-amber-400' />}
            {getPostTypeBadge(post.type)}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <Link href={`/posts/${post.id}`} className='block group'>
          <h3 className='text-lg font-semibold text-white group-hover:text-amber-400 transition-colors mb-2'>
            {post.title}
          </h3>

          {post.excerpt && !compact && (
            <p className='text-gray-300 mb-3 line-clamp-3'>{post.excerpt}</p>
          )}
        </Link>

        {/* Interaction buttons */}
        <div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-700'>
          <div className='flex items-center gap-4'>
            {/* Vote buttons */}
            <div className='flex items-center gap-1'>
              {isAuthenticated ? (
                <>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleVote('like')}
                    disabled={isVoting}
                    className={`h-8 px-2 ${
                      post.user_vote === 'like'
                        ? 'text-green-400 bg-green-500/20'
                        : 'text-gray-400 hover:text-green-400'
                    }`}
                  >
                    <Heart className='h-4 w-4' />
                    <span className='ml-1'>{post.likes_count}</span>
                  </Button>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleVote('dislike')}
                    disabled={isVoting}
                    className={`h-8 px-2 ${
                      post.user_vote === 'dislike'
                        ? 'text-red-400 bg-red-500/20'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <HeartOff className='h-4 w-4' />
                    <span className='ml-1'>{post.dislikes_count}</span>
                  </Button>
                </>
              ) : (
                <div className='flex items-center gap-1'>
                  <div className='flex items-center gap-1 text-gray-500 px-2 py-1'>
                    <Heart className='h-4 w-4' />
                    <span className='ml-1'>{post.likes_count}</span>
                  </div>
                  <div className='flex items-center gap-1 text-gray-500 px-2 py-1'>
                    <HeartOff className='h-4 w-4' />
                    <span className='ml-1'>{post.dislikes_count}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            {isAuthenticated ? (
              <Link href={`/posts/${post.id}#comments`}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2 text-gray-400 hover:text-blue-400'
                >
                  <MessageCircle className='h-4 w-4' />
                  <span className='ml-1'>{post.comments_count}</span>
                </Button>
              </Link>
            ) : (
              <div className='flex items-center gap-1 text-gray-500 px-2 py-1'>
                <MessageCircle className='h-4 w-4' />
                <span className='ml-1'>{post.comments_count}</span>
              </div>
            )}

            {/* Bookmark */}
            {isAuthenticated ? (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`h-8 px-2 ${
                  post.user_bookmarked
                    ? 'text-amber-400 bg-amber-500/20'
                    : 'text-gray-400 hover:text-amber-400'
                }`}
              >
                {post.user_bookmarked ? (
                  <BookmarkCheck className='h-4 w-4' />
                ) : (
                  <Bookmark className='h-4 w-4' />
                )}
                <span className='ml-1'>{post.bookmarks_count}</span>
              </Button>
            ) : (
              <div className='flex items-center gap-1 text-gray-500 px-2 py-1'>
                <Bookmark className='h-4 w-4' />
                <span className='ml-1'>{post.bookmarks_count}</span>
              </div>
            )}
          </div>

          {/* Share button */}
          {isAuthenticated ? (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleShare()}
              disabled={isSharing}
              className='h-8 px-2 text-gray-400 hover:text-purple-400'
            >
              <Share2 className='h-4 w-4' />
              <span className='ml-1'>{post.shares_count}</span>
            </Button>
          ) : (
            <div className='flex items-center gap-1 text-gray-500 px-2 py-1'>
              <Share2 className='h-4 w-4' />
              <span className='ml-1'>{post.shares_count}</span>
            </div>
          )}
        </div>

        {/* Login prompt for non-authenticated users */}
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
