'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  AdminPost,
  bulkDeletePosts,
  bulkUpdatePosts,
  deletePost,
  fetchAdminPosts,
  fetchPostsStats,
  togglePostFeature,
  togglePostVisibility,
} from '@/lib/api/admin-apis/posts';
import {
  AlertTriangle,
  BarChart3,
  Eye,
  EyeOff,
  FileText,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Search,
  Star,
  StarOff,
  Trash2,
  TrendingUp,
  View,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PostsStats {
  total: number;
  published: number;
  draft: number;
  hidden: number;
  reported: number;
  totalViews: number;
  totalLikes: number;
  recentPosts: number;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [stats, setStats] = useState<PostsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    sortBy: 'created_at' as const,
    sortOrder: 'desc' as const,
  });

  const postsPerPage = 10;

  useEffect(() => {
    loadPosts();
    loadStats();
  }, [currentPage, filters]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: postsPerPage,
        search: filters.search || undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const { posts: fetchedPosts, total } = await fetchAdminPosts(params);
      setPosts(fetchedPosts);
      setTotalPosts(total);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Hiba',
        description: 'A posztok betöltése sikertelen',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const fetchedStats = await fetchPostsStats();
      setStats(fetchedStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      toast({
        title: 'Siker',
        description: 'A poszt sikeresen törölve',
      });
      loadPosts();
      loadStats();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Hiba',
        description: 'A poszt törlése sikertelen',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeature = async (postId: string, featured: boolean) => {
    try {
      await togglePostFeature(postId, featured);
      toast({
        title: 'Siker',
        description: featured ? 'Poszt kiemelve' : 'Kiemelés eltávolítva',
      });
      loadPosts();
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: 'Hiba',
        description: 'A művelet sikertelen',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVisibility = async (postId: string, hidden: boolean) => {
    try {
      await togglePostVisibility(postId, hidden);
      toast({
        title: 'Siker',
        description: hidden ? 'Poszt elrejtve' : 'Poszt megjelenítve',
      });
      loadPosts();
      loadStats();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'Hiba',
        description: 'A művelet sikertelen',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;

    try {
      await bulkDeletePosts(selectedPosts);
      toast({
        title: 'Siker',
        description: `${selectedPosts.length} poszt törölve`,
      });
      setSelectedPosts([]);
      loadPosts();
      loadStats();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast({
        title: 'Hiba',
        description: 'A tömeges törlés sikertelen',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUpdate = async (updates: Partial<AdminPost>) => {
    if (selectedPosts.length === 0) return;

    try {
      await bulkUpdatePosts(selectedPosts, updates);
      toast({
        title: 'Siker',
        description: `${selectedPosts.length} poszt frissítve`,
      });
      setSelectedPosts([]);
      loadPosts();
      loadStats();
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast({
        title: 'Hiba',
        description: 'A tömeges frissítés sikertelen',
        variant: 'destructive',
      });
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <TrendingUp className='h-4 w-4' />;
      case 'discussion':
        return <MessageSquare className='h-4 w-4' />;
      case 'question':
        return <AlertTriangle className='h-4 w-4' />;
      case 'analysis':
        return <BarChart3 className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
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

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent'>
            Posztok kezelése
          </h1>
          <p className='text-muted-foreground'>Posztok moderálása, szerkesztése és statisztikák</p>
        </div>
        <Button
          onClick={() => router.push('/admin/posts/create')}
          className='bg-amber-600 hover:bg-amber-700'
        >
          <FileText className='mr-2 h-4 w-4' />
          Új poszt
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-300'>Összes poszt</CardTitle>
              <FileText className='h-4 w-4 text-amber-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>{stats.total}</div>
              <p className='text-xs text-green-400'>+{stats.recentPosts} az elmúlt héten</p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-300'>Publikált</CardTitle>
              <Eye className='h-4 w-4 text-green-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>{stats.published}</div>
              <p className='text-xs text-gray-400'>
                {stats.draft} vázlat, {stats.hidden} rejtett
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-300'>
                Összes megtekintés
              </CardTitle>
              <View className='h-4 w-4 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {stats.totalViews.toLocaleString()}
              </div>
              <p className='text-xs text-gray-400'>{stats.totalLikes} like összesen</p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-300'>Jelentések</CardTitle>
              <AlertTriangle className='h-4 w-4 text-red-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>{stats.reported}</div>
              <p className='text-xs text-red-400'>Moderációra vár</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
        <CardHeader>
          <CardTitle className='text-white'>Szűrők</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
            <div className='space-y-2'>
              <Label htmlFor='search' className='text-gray-300'>
                Keresés
              </Label>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-400' />
                <Input
                  id='search'
                  placeholder='Cím vagy tartalom...'
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className='pl-8 bg-gray-800 border-gray-600 text-white'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-300'>Típus</Label>
              <Select
                value={filters.type}
                onValueChange={value => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Minden típus</SelectItem>
                  <SelectItem value='tip'>Tipp</SelectItem>
                  <SelectItem value='discussion'>Beszélgetés</SelectItem>
                  <SelectItem value='question'>Kérdés</SelectItem>
                  <SelectItem value='analysis'>Elemzés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-300'>Státusz</Label>
              <Select
                value={filters.status}
                onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Minden státusz</SelectItem>
                  <SelectItem value='published'>Publikált</SelectItem>
                  <SelectItem value='draft'>Vázlat</SelectItem>
                  <SelectItem value='hidden'>Rejtett</SelectItem>
                  <SelectItem value='archived'>Archivált</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-300'>Rendezés</Label>
              <Select
                value={filters.sortBy}
                onValueChange={value => setFilters(prev => ({ ...prev, sortBy: value as any }))}
              >
                <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='created_at'>Létrehozás dátuma</SelectItem>
                  <SelectItem value='updated_at'>Módosítás dátuma</SelectItem>
                  <SelectItem value='views_count'>Megtekintések</SelectItem>
                  <SelectItem value='likes_count'>Kedvelések</SelectItem>
                  <SelectItem value='reports_count'>Jelentések</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-300'>Irány</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={value => setFilters(prev => ({ ...prev, sortOrder: value as any }))}
              >
                <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>Csökkenő</SelectItem>
                  <SelectItem value='asc'>Növekvő</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <Card className='bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-amber-200'>{selectedPosts.length} poszt kiválasztva</span>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleBulkUpdate({ is_featured: true })}
                  className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
                >
                  Kiemelés
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleBulkUpdate({ status: 'hidden' })}
                  className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
                >
                  Elrejtés
                </Button>
                <Button variant='destructive' size='sm' onClick={handleBulkDelete}>
                  Törlés
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Table */}
      <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
        <CardHeader>
          <CardTitle className='text-white'>Posztok</CardTitle>
          <CardDescription className='text-gray-400'>
            Összes poszt kezelése és moderálása
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='h-16 bg-gray-800 rounded animate-pulse' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className='border-gray-700'>
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={selectedPosts.length === posts.length && posts.length > 0}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedPosts(posts.map(p => p.id));
                        } else {
                          setSelectedPosts([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className='text-gray-300'>Poszt</TableHead>
                  <TableHead className='text-gray-300'>Szerző</TableHead>
                  <TableHead className='text-gray-300'>Típus</TableHead>
                  <TableHead className='text-gray-300'>Státusz</TableHead>
                  <TableHead className='text-gray-300'>Statisztikák</TableHead>
                  <TableHead className='text-gray-300'>Dátum</TableHead>
                  <TableHead className='text-gray-300 w-12'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map(post => (
                  <TableRow key={post.id} className='border-gray-700'>
                    <TableCell>
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setSelectedPosts(prev => [...prev, post.id]);
                          } else {
                            setSelectedPosts(prev => prev.filter(id => id !== post.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          {post.is_featured && <Star className='h-4 w-4 text-amber-400' />}
                          {post.is_reported && <AlertTriangle className='h-4 w-4 text-red-400' />}
                          <span className='font-medium text-white line-clamp-1'>{post.title}</span>
                        </div>
                        {post.excerpt && (
                          <p className='text-sm text-gray-400 line-clamp-2'>{post.excerpt}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {post.author?.profile_image && (
                          <img
                            src={post.author.profile_image}
                            alt={post.author.username}
                            className='h-6 w-6 rounded-full'
                          />
                        )}
                        <span className='text-white'>{post.author?.username || 'Ismeretlen'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {getPostTypeIcon(post.type)}
                        <span className='text-gray-300 capitalize'>{post.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <div className='space-y-1 text-sm'>
                        <div className='flex items-center gap-1 text-gray-400'>
                          <View className='h-3 w-3' />
                          {post.views_count}
                        </div>
                        <div className='flex items-center gap-1 text-gray-400'>
                          <Heart className='h-3 w-3' />
                          {post.likes_count}
                        </div>
                        <div className='flex items-center gap-1 text-gray-400'>
                          <MessageSquare className='h-3 w-3' />
                          {post.comments_count}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm text-gray-400'>
                        <div>{new Date(post.created_at).toLocaleDateString('hu-HU')}</div>
                        <div className='text-xs'>
                          {new Date(post.created_at).toLocaleTimeString('hu-HU')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Műveletek</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/admin/posts/${post.id}`)}>
                            <Eye className='mr-2 h-4 w-4' />
                            Megtekintés
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                          >
                            <FileText className='mr-2 h-4 w-4' />
                            Szerkesztés
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleFeature(post.id, !post.is_featured)}
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
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleVisibility(post.id, post.status !== 'hidden')
                            }
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
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-red-400 focus:text-red-400'
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Törlés
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between mt-4'>
              <div className='text-sm text-gray-400'>
                Oldal {currentPage} / {totalPages} (összesen {totalPosts} poszt)
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className='border-gray-600 text-gray-300'
                >
                  Előző
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className='border-gray-600 text-gray-300'
                >
                  Következő
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
