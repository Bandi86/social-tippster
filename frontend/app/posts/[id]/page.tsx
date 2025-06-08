'use client';

import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  Crown,
  Edit,
  Eye,
  FileText,
  Flag,
  Heart,
  HeartOff,
  MessageCircle,
  MessageSquare,
  Pin,
  Share2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { usePostsStore } from '@/store/posts';
import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';

import type { Post } from '@/store/posts';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Local state - not subscribed to store
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [isVoting, setIsVoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Refs to prevent multiple calls
  const hasInitialized = useRef(false);
  const currentPostId = useRef<string | null>(null);

  // Get store functions directly - not subscribing to state changes
  const { voteOnPost, removeVoteFromPost, toggleBookmark, sharePost, deletePost } =
    usePostsStore.getState();

  useEffect(() => {
    const loadPost = async () => {
      // Prevent multiple initializations
      if (hasInitialized.current) return;

      try {
        const resolvedParams = await params;
        const id = resolvedParams.id as string;

        // Skip if same post ID
        if (currentPostId.current === id) return;

        console.log('🆔 Loading post with ID:', id);
        currentPostId.current = id;
        hasInitialized.current = true;

        setLoading(true);
        setError(null);

        // Get store functions when needed
        const storeActions = usePostsStore.getState();

        // Call store function directly without subscribing to store state
        await storeActions.fetchPostById(id);

        // Get the post from store state (one-time read)
        const storeState = usePostsStore.getState();
        if (storeState.currentPost) {
          setPost(storeState.currentPost);

          // Track view after successful load
          if (isAuthenticated) {
            storeActions.trackPostView(id);
          }
        } else if (storeState.error) {
          setError(storeState.error);
        }
      } catch (err) {
        console.error('Error loading post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!post || isVoting || !isAuthenticated) return;
    setIsVoting(true);

    try {
      if (post.user_vote === type) {
        await removeVoteFromPost(post.id);
        // Update local state
        setPost((prev: Post | null) =>
          prev
            ? {
                ...prev,
                likes_count: type === 'like' ? prev.likes_count - 1 : prev.likes_count,
                dislikes_count: type === 'dislike' ? prev.dislikes_count - 1 : prev.dislikes_count,
                user_vote: null,
              }
            : null,
        );
      } else {
        await voteOnPost(post.id, type);
        // Update local state
        setPost((prev: Post | null) =>
          prev
            ? {
                ...prev,
                likes_count: type === 'like' ? prev.likes_count + 1 : prev.likes_count,
                dislikes_count: type === 'dislike' ? prev.dislikes_count + 1 : prev.dislikes_count,
                user_vote: type,
              }
            : null,
        );
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
    if (!post || isBookmarking || !isAuthenticated) return;
    setIsBookmarking(true);

    try {
      const result = await toggleBookmark(post.id);
      // Update local state
      setPost((prev: Post | null) =>
        prev
          ? {
              ...prev,
              user_bookmarked: result.bookmarked,
              bookmarks_count: result.bookmarked
                ? prev.bookmarks_count + 1
                : prev.bookmarks_count - 1,
            }
          : null,
      );

      toast({
        title: 'Sikeres',
        description: result.bookmarked ? 'Könyvjelzőkhöz adva' : 'Eltávolítva a könyvjelzőkből',
      });
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: 'Hiba',
        description: 'A könyvjelző művelet sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = async (platform?: string) => {
    if (!post || isSharing) return;
    setIsSharing(true);

    try {
      await sharePost(post.id, platform);
      // Update local state
      setPost((prev: Post | null) =>
        prev
          ? {
              ...prev,
              shares_count: prev.shares_count + 1,
            }
          : null,
      );

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

  const handleDeletePost = async () => {
    if (!post || !user) return;

    if (!confirm('Biztosan törölni szeretné ezt a posztot?')) return;

    try {
      await deletePost(post.id);
      toast({
        title: 'Sikeres',
        description: 'A poszt törölve',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Hiba',
        description: 'A poszt törlése sikertelen',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <MessageSquare className='h-5 w-5' />;
      case 'discussion':
        return <MessageSquare className='h-5 w-5' />;
      case 'news':
        return <FileText className='h-5 w-5' />;
      case 'analysis':
        return <BarChart3 className='h-5 w-5' />;
      case 'help_request':
        return <MessageCircle className='h-5 w-5' />;
      default:
        return <FileText className='h-5 w-5' />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const variants = {
      general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      discussion: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      news: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      analysis: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      help_request: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
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

  const isOwner = user && post && user.user_id === post.author_id;

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4'></div>
          <p className='text-gray-400'>Poszt betöltése...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-400 mb-4'>{error || 'A poszt nem található'}</p>
          <Link href='/dashboard'>
            <Button
              variant='outline'
              className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Vissza a főoldalra
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <div className='container max-w-4xl mx-auto px-4 py-8'>
        {/* Back button */}
        <div className='mb-6'>
          <Link href='/dashboard'>
            <Button variant='ghost' className='text-gray-400 hover:text-white hover:bg-gray-800'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Vissza
            </Button>
          </Link>
        </div>

        {/* Main post card */}
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-6'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                {/* Author info */}
                <div className='flex items-center gap-3 mb-4'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage
                      src={post.author?.profile_image}
                      alt={post.author?.username || 'Felhasználó'}
                    />
                    <AvatarFallback className='bg-gray-700 text-white'>
                      {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/profile/${post.author?.username}`}
                      className='font-medium text-white hover:text-amber-400 transition-colors'
                    >
                      {post.author?.username || 'Névtelen felhasználó'}
                    </Link>
                    <div className='flex items-center gap-2 text-sm text-gray-400'>
                      <span>
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: hu,
                        })}
                      </span>
                      {post.author?.reputation_score && post.author.reputation_score > 100 && (
                        <Crown className='h-4 w-4 text-amber-400' />
                      )}
                    </div>
                  </div>
                </div>

                {/* Post title and badges */}
                <div className='flex items-start gap-2 mb-4'>
                  {getPostTypeBadge(post.type)}
                  {post.is_featured && (
                    <Badge className='bg-amber-600/20 text-amber-400 border-amber-600/30'>
                      <Crown className='h-3 w-3 mr-1' />
                      Kiemelt
                    </Badge>
                  )}
                  {post.is_pinned && (
                    <Badge className='bg-green-600/20 text-green-400 border-green-600/30'>
                      <Pin className='h-3 w-3 mr-1' />
                      Rögzített
                    </Badge>
                  )}
                </div>

                <h1 className='text-2xl lg:text-3xl font-bold text-white mb-4'>{post.title}</h1>
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='border-gray-600 text-gray-400 hover:bg-gray-700'
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    className='border-red-600 text-red-400 hover:bg-red-900/50'
                    onClick={handleDeletePost}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Post content */}
            <div className='prose prose-invert max-w-none mb-6'>
              <div className='text-gray-300 leading-relaxed whitespace-pre-wrap'>
                {post.content}
              </div>
            </div>

            {/* Post image */}
            {post.image_url && (
              <div className='mb-6'>
                <img
                  src={post.image_url}
                  alt='Post image'
                  className='rounded-lg max-w-full h-auto'
                />
              </div>
            )}

            {/* Post stats */}
            <div className='flex items-center justify-between border-t border-gray-700 pt-4'>
              <div className='flex items-center gap-6 text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <Eye className='h-4 w-4' />
                  <span>{post.views_count || 0}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Heart className='h-4 w-4' />
                  <span>{post.likes_count || 0}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <MessageSquare className='h-4 w-4' />
                  <span>{post.comments_count || 0}</span>
                </div>
              </div>

              {/* Action buttons */}
              {isAuthenticated && (
                <div className='flex items-center gap-2'>
                  {/* Vote buttons */}
                  <div className='flex items-center gap-1'>
                    <Button
                      size='sm'
                      variant={post.user_vote === 'like' ? 'default' : 'outline'}
                      className={
                        post.user_vote === 'like'
                          ? 'bg-green-600 hover:bg-green-700 border-green-600'
                          : 'border-gray-600 text-gray-400 hover:bg-gray-700'
                      }
                      onClick={() => handleVote('like')}
                      disabled={isVoting}
                    >
                      <Heart className='h-4 w-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant={post.user_vote === 'dislike' ? 'destructive' : 'outline'}
                      className={
                        post.user_vote === 'dislike'
                          ? ''
                          : 'border-gray-600 text-gray-400 hover:bg-gray-700'
                      }
                      onClick={() => handleVote('dislike')}
                      disabled={isVoting}
                    >
                      <HeartOff className='h-4 w-4' />
                    </Button>
                  </div>

                  {/* Bookmark button */}
                  <Button
                    size='sm'
                    variant={post.user_bookmarked ? 'default' : 'outline'}
                    className={
                      post.user_bookmarked
                        ? 'bg-amber-600 hover:bg-amber-700 border-amber-600'
                        : 'border-gray-600 text-gray-400 hover:bg-gray-700'
                    }
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                  >
                    <Bookmark className='h-4 w-4' />
                  </Button>

                  {/* Share button */}
                  <Button
                    size='sm'
                    variant='outline'
                    className='border-gray-600 text-gray-400 hover:bg-gray-700'
                    onClick={() => handleShare()}
                    disabled={isSharing}
                  >
                    <Share2 className='h-4 w-4' />
                  </Button>

                  {/* Report button */}
                  <Button
                    size='sm'
                    variant='outline'
                    className='border-gray-600 text-gray-400 hover:bg-gray-700'
                  >
                    <Flag className='h-4 w-4' />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments section - will be added in future iteration */}
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
          <CardHeader>
            <h2 className='text-xl font-semibold text-white'>
              Hozzászólások ({post.comments_count || 0})
            </h2>
          </CardHeader>
          <CardContent>
            <div className='text-center text-gray-400 py-8'>
              A hozzászólások hamarosan elérhetők lesznek.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
