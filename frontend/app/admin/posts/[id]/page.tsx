'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  AdminPost,
  deletePost,
  fetchPostById,
  togglePostFeature,
  togglePostVisibility,
} from '@/lib/api/admin-apis/posts';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  Star,
  StarOff,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<AdminPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const fetchedPost = await fetchPostById(postId);
      setPost(fetchedPost);
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: 'Hiba',
        description: 'A poszt betöltése sikertelen',
        variant: 'destructive',
      });
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    if (!confirm('Biztosan törölni szeretnéd ezt a posztot?')) return;

    try {
      await deletePost(post.id);
      toast({
        title: 'Siker',
        description: 'A poszt sikeresen törölve',
      });
      router.push('/admin/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Hiba',
        description: 'A poszt törlése sikertelen',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeature = async () => {
    if (!post) return;

    try {
      await togglePostFeature(post.id, !post.is_featured);
      setPost(prev => (prev ? { ...prev, is_featured: !prev.is_featured } : null));
      toast({
        title: 'Siker',
        description: post.is_featured ? 'Kiemelés eltávolítva' : 'Poszt kiemelve',
      });
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: 'Hiba',
        description: 'A művelet sikertelen',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVisibility = async () => {
    if (!post) return;

    try {
      const hidden = post.status !== 'hidden';
      await togglePostVisibility(post.id, hidden);
      setPost(prev => (prev ? { ...prev, status: hidden ? 'hidden' : 'published' } : null));
      toast({
        title: 'Siker',
        description: hidden ? 'Poszt elrejtve' : 'Poszt megjelenítve',
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'Hiba',
        description: 'A művelet sikertelen',
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
      case 'question':
        return <AlertTriangle className='h-5 w-5' />;
      case 'analysis':
        return <BarChart3 className='h-5 w-5' />;
      default:
        return <FileText className='h-5 w-5' />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      hidden: 'destructive',
      archived: 'outline',
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='h-8 bg-gray-800 rounded animate-pulse' />
        <div className='grid gap-4 md:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-32 bg-gray-800 rounded animate-pulse' />
          ))}
        </div>
        <div className='h-96 bg-gray-800 rounded animate-pulse' />
      </div>
    );
  }

  if (!post) {
    return (
      <div className='text-center py-12'>
        <FileText className='mx-auto h-12 w-12 text-gray-400' />
        <h3 className='mt-2 text-sm font-medium text-gray-300'>Poszt nem található</h3>
        <p className='mt-1 text-sm text-gray-500'>
          A keresett poszt nem létezik vagy törölve lett.
        </p>
        <div className='mt-6'>
          <Button onClick={() => router.push('/admin/posts')}>Vissza a posztokhoz</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            onClick={() => router.push('/admin/posts')}
            className='text-gray-400 hover:text-white'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Vissza
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent'>
              Poszt részletei
            </h1>
            <p className='text-muted-foreground'>{post.title}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
            className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
          >
            <Edit className='mr-2 h-4 w-4' />
            Szerkesztés
          </Button>
          <Button variant='destructive' onClick={handleDeletePost}>
            <Trash2 className='mr-2 h-4 w-4' />
            Törlés
          </Button>
        </div>
      </div>

      {/* Post Info Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-300'>Állapot</CardTitle>
            {getPostTypeIcon(post.type)}
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {getStatusBadge(post.status)}
              <div className='flex items-center gap-2'>
                {post.is_featured && (
                  <Badge variant='secondary' className='bg-amber-900/30 text-amber-400'>
                    <Star className='mr-1 h-3 w-3' />
                    Kiemelt
                  </Badge>
                )}
                {post.is_reported && (
                  <Badge variant='destructive'>
                    <AlertTriangle className='mr-1 h-3 w-3' />
                    Jelentve ({post.reports_count})
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-300'>Statisztikák</CardTitle>
            <BarChart3 className='h-4 w-4 text-blue-400' />
          </CardHeader>
          <CardContent>
            <div className='space-y-1'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Megtekintések:</span>
                <span className='text-white'>{post.views_count}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Kedvelések:</span>
                <span className='text-white'>{post.likes_count}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Kommentek:</span>
                <span className='text-white'>{post.comments_count}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>Megosztások:</span>
                <span className='text-white'>{post.shares_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-300'>Szerző</CardTitle>
            <User className='h-4 w-4 text-green-400' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {post.author ? (
                <div className='flex items-center gap-2'>
                  {post.author.profile_image && (
                    <img
                      src={post.author.profile_image}
                      alt={post.author.username}
                      className='h-8 w-8 rounded-full'
                    />
                  )}
                  <div>
                    <div className='font-medium text-white'>{post.author.username}</div>
                    <div className='text-xs text-gray-400'>{post.author.email}</div>
                  </div>
                </div>
              ) : (
                <span className='text-gray-400'>Ismeretlen szerző</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
        <CardHeader>
          <CardTitle className='text-white'>Műveletek</CardTitle>
          <CardDescription className='text-gray-400'>Poszt moderálási lehetőségek</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleToggleFeature}
              className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
            >
              {post.is_featured ? (
                <>
                  <StarOff className='mr-2 h-4 w-4' />
                  Kiemelés eltávolítása
                </>
              ) : (
                <>
                  <Star className='mr-2 h-4 w-4' />
                  Kiemelés
                </>
              )}
            </Button>
            <Button
              variant='outline'
              onClick={handleToggleVisibility}
              className='border-gray-600 text-gray-300 hover:bg-gray-700'
            >
              {post.status === 'hidden' ? (
                <>
                  <Eye className='mr-2 h-4 w-4' />
                  Megjelenítés
                </>
              ) : (
                <>
                  <EyeOff className='mr-2 h-4 w-4' />
                  Elrejtés
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Post Content */}
      <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-white'>{post.title}</CardTitle>
              <CardDescription className='text-gray-400 mt-2'>
                <div className='flex items-center gap-4 text-sm'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    {new Date(post.created_at).toLocaleDateString('hu-HU')}
                  </span>
                  <span className='capitalize'>{post.type}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span className='flex items-center gap-1'>
                      {post.tags.map(tag => (
                        <Badge key={tag} variant='outline' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </span>
                  )}
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='prose prose-invert max-w-none'>
            <div className='text-gray-300 whitespace-pre-wrap'>{post.content}</div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
        <CardHeader>
          <CardTitle className='text-white'>Időbélyegek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <Label className='text-gray-300'>Létrehozva</Label>
              <div className='text-white'>{new Date(post.created_at).toLocaleString('hu-HU')}</div>
            </div>
            <div>
              <Label className='text-gray-300'>Módosítva</Label>
              <div className='text-white'>{new Date(post.updated_at).toLocaleString('hu-HU')}</div>
            </div>
            {post.published_at && (
              <div>
                <Label className='text-gray-300'>Publikálva</Label>
                <div className='text-white'>
                  {new Date(post.published_at).toLocaleString('hu-HU')}
                </div>
              </div>
            )}
            {post.deleted_at && (
              <div>
                <Label className='text-gray-300'>Törölve</Label>
                <div className='text-red-400'>
                  {new Date(post.deleted_at).toLocaleString('hu-HU')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium ${className}`}>{children}</div>;
}
