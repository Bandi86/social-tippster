'use client';

import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  BookmarkCheck,
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
  TrendingUp,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CommentList from '@/components/user/CommentList';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import Link from 'next/link';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    currentPost: post,
    isLoading: loading,
    fetchPostById,
    voteOnPost,
    removeVoteFromPost,
    toggleBookmark,
    sharePost,
    deletePost,
    trackPostView,
    updatePostLocally,
  } = usePosts();
  const [isVoting, setIsVoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      await fetchPostById(postId);
      // Track view after loading
      await trackPostView(postId);
    } catch (error) {
      console.error('Failed to load post:', error);
      toast({
        title: 'Hiba',
        description: 'A poszt betöltése sikertelen',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  };

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!post || isVoting || !isAuthenticated) return;
    setIsVoting(true);

    try {
      if (post.user_vote === type) {
        await removeVoteFromPost(post.id);
        // Update handled by store
      } else {
        await voteOnPost(post.id, type);
        // Update handled by store
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
      // Update handled by store

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
      // Update handled by store

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

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <TrendingUp className='h-5 w-5' />;
      case 'discussion':
        return <MessageSquare className='h-5 w-5' />;
      case 'news':
        return <FileText className='h-5 w-5' />;
      case 'analysis':
        return <BarChart3 className='h-5 w-5' />;
      default:
        return <FileText className='h-5 w-5' />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const variants = {
      tip: 'bg-green-500/20 text-green-400 border-green-500/30',
      discussion: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      news: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      analysis: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
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

  const renderTipDetails = () => {
    if (!post || post.type !== 'tip' || (!post.odds && !post.stake && !post.confidence))
      return null;

    return (
      <Card className='bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700'>
        <CardHeader>
          <h3 className='text-green-400 font-semibold flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            Tipp részletei
          </h3>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {post.odds && (
              <div className='text-center p-3 bg-gray-800/50 rounded-lg'>
                <div className='text-sm text-gray-400 mb-1'>Odds</div>
                <div className='text-lg font-semibold text-green-400'>{post.odds}</div>
              </div>
            )}
            {post.stake && (
              <div className='text-center p-3 bg-gray-800/50 rounded-lg'>
                <div className='text-sm text-gray-400 mb-1'>Tét</div>
                <div className='text-lg font-semibold text-blue-400'>{post.stake}/10</div>
              </div>
            )}
            {post.confidence && (
              <div className='text-center p-3 bg-gray-800/50 rounded-lg'>
                <div className='text-sm text-gray-400 mb-1'>Bizalom</div>
                <div className='text-lg font-semibold text-amber-400'>{post.confidence}/5</div>
              </div>
            )}
          </div>
          {post.betting_market && (
            <div className='mt-4 p-3 bg-gray-800/50 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Fogadási piac</div>
              <div className='text-white'>{post.betting_market}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const isOwner = user && post && user.user_id === post.author_id;

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

  if (!post) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-400 mb-4'>A poszt nem található</p>
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
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='text-gray-400 hover:text-white'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Vissza
          </Button>

          {isOwner && (
            <div className='flex gap-2'>
              <Link href={`/posts/${post.id}/edit`}>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Szerkesztés
                </Button>
              </Link>
              <Button variant='destructive' size='sm' onClick={handleDeletePost}>
                <Trash2 className='h-4 w-4 mr-2' />
                Törlés
              </Button>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Post Card */}
            <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-12 w-12'>
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
                          className='font-semibold text-white hover:text-amber-400 transition-colors'
                        >
                          {post.author?.username || 'Ismeretlen felhasználó'}
                        </Link>
                        {post.author?.reputation_score && post.author.reputation_score > 100 && (
                          <Crown className='h-4 w-4 text-amber-400' />
                        )}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-400'>
                        <span>
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: hu,
                          })}
                        </span>
                        <span>•</span>
                        <div className='flex items-center gap-1'>
                          <Eye className='h-3 w-3' />
                          <span>{post.views_count} megtekintés</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {post.is_pinned && <Pin className='h-5 w-5 text-amber-400' />}
                    {post.is_featured && <Crown className='h-5 w-5 text-amber-400' />}
                    {getPostTypeBadge(post.type)}
                  </div>
                </div>

                <h1 className='text-2xl lg:text-3xl font-bold text-white mt-4'>{post.title}</h1>
              </CardHeader>

              <CardContent>
                <div className='prose prose-lg prose-invert max-w-none'>
                  <div className='text-gray-300 whitespace-pre-wrap'>{post.content}</div>
                </div>

                {renderTipDetails()}

                <Separator className='my-6 bg-gray-700' />

                {/* Interaction buttons */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    {/* Vote buttons */}
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleVote('like')}
                        disabled={isVoting || !isAuthenticated}
                        className={`h-9 px-3 ${
                          post.user_vote === 'like'
                            ? 'text-green-400 bg-green-500/20'
                            : 'text-gray-400 hover:text-green-400'
                        }`}
                      >
                        <Heart className='h-4 w-4' />
                        <span className='ml-2'>{post.likes_count}</span>
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleVote('dislike')}
                        disabled={isVoting || !isAuthenticated}
                        className={`h-9 px-3 ${
                          post.user_vote === 'dislike'
                            ? 'text-red-400 bg-red-500/20'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <HeartOff className='h-4 w-4' />
                        <span className='ml-2'>{post.dislikes_count}</span>
                      </Button>
                    </div>

                    {/* Comments */}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-9 px-3 text-gray-400 hover:text-blue-400'
                    >
                      <MessageCircle className='h-4 w-4' />
                      <span className='ml-2'>{post.comments_count} komment</span>
                    </Button>

                    {/* Bookmark */}
                    {isAuthenticated && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleBookmark}
                        disabled={isBookmarking}
                        className={`h-9 px-3 ${
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
                        <span className='ml-2'>{post.bookmarks_count}</span>
                      </Button>
                    )}
                  </div>

                  {/* Share and Report */}
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleShare()}
                      disabled={isSharing}
                      className='h-9 px-3 text-gray-400 hover:text-purple-400'
                    >
                      <Share2 className='h-4 w-4' />
                      <span className='ml-2'>{post.shares_count}</span>
                    </Button>

                    {!isOwner && isAuthenticated && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-9 px-3 text-gray-400 hover:text-red-400'
                      >
                        <Flag className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <CommentList
              postId={post.id}
              className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'
            />
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Author Info */}
            <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
              <CardHeader>
                <h3 className='text-lg font-semibold text-white'>Szerző</h3>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-3 mb-4'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage
                      src={post.author?.profile_image}
                      alt={post.author?.username || 'Felhasználó'}
                    />
                    <AvatarFallback className='bg-amber-600 text-white'>
                      {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/profile/${post.author?.username}`}
                      className='font-medium text-white hover:text-amber-400 transition-colors'
                    >
                      {post.author?.username || 'Ismeretlen'}
                    </Link>
                    {post.author?.reputation_score && (
                      <div className='text-sm text-gray-400'>
                        Pontszám: {post.author.reputation_score}
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/profile/${post.author?.username}`}>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-amber-600 text-amber-400 hover:bg-amber-900/50'
                  >
                    Profil megtekintése
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Post Stats */}
            <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
              <CardHeader>
                <h3 className='text-lg font-semibold text-white'>Statisztikák</h3>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Megtekintések:</span>
                  <span className='text-white'>{post.views_count}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Kedvelések:</span>
                  <span className='text-green-400'>{post.likes_count}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Nem kedvelések:</span>
                  <span className='text-red-400'>{post.dislikes_count}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Kommentek:</span>
                  <span className='text-blue-400'>{post.comments_count}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Könyvjelzők:</span>
                  <span className='text-amber-400'>{post.bookmarks_count}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Megosztások:</span>
                  <span className='text-purple-400'>{post.shares_count}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
              <CardHeader>
                <h3 className='text-lg font-semibold text-white'>Kapcsolódó posztok</h3>
              </CardHeader>
              <CardContent>
                <div className='text-center py-4 text-gray-400'>
                  <p className='text-sm'>Hamarosan...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
