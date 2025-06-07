'use client';

import { BarChart3, Filter, Flame, MessageSquare, Plus, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import PostCard from '@/components/features/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/store/posts';

export default function PostsPage() {
  const [filter, setFilter] = useState<'all' | 'tips' | 'discussion' | 'analysis'>('all');

  const { posts, isLoading, fetchPosts, error } = usePosts();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchPosts({
          page: 1,
          limit: 20,
          type: filter === 'all' ? undefined : filter === 'tips' ? 'general' : filter,
        });
      } catch (error) {
        console.error('Failed to load posts:', error);
      }
    };

    loadPosts();
  }, [filter, fetchPosts]);

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    // This is handled automatically by the Zustand store
    console.log('Post updated:', postId, updates);
  };

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'tips':
        return <TrendingUp className='h-4 w-4' />;
      case 'discussion':
        return <MessageSquare className='h-4 w-4' />;
      case 'analysis':
        return <BarChart3 className='h-4 w-4' />;
      default:
        return <Flame className='h-4 w-4' />;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Sidebar */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Create Post Card */}
            {isAuthenticated && (
              <Card className='bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500 shadow-lg'>
                <CardContent className='p-6 text-center'>
                  <div className='flex items-center justify-center mb-3'>
                    <Plus className='h-6 w-6 text-amber-200' />
                  </div>
                  <h3 className='text-lg font-bold text-white mb-2'>Oszd meg gondolataidat!</h3>
                  <p className='text-amber-100 text-sm mb-4'>
                    Írj új tippet, elemzést vagy indíts beszélgetést
                  </p>
                  <Button
                    className='w-full bg-white/20 hover:bg-white/30 text-white border-white/30'
                    onClick={() => (window.location.href = '/posts/create')}
                  >
                    Új poszt
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Filter Navigation */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <Filter className='h-5 w-5' />
                  Szűrés
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {[
                  { key: 'all', label: 'Összes poszt', icon: 'flame' },
                  { key: 'tips', label: 'Fogadási tippek', icon: 'tips' },
                  { key: 'discussion', label: 'Beszélgetések', icon: 'discussion' },
                  { key: 'analysis', label: 'Elemzések', icon: 'analysis' },
                ].map(item => (
                  <Button
                    key={item.key}
                    variant={filter === item.key ? 'default' : 'ghost'}
                    size='sm'
                    className={`w-full justify-start ${
                      filter === item.key
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                    onClick={() =>
                      setFilter(item.key as 'all' | 'tips' | 'discussion' | 'analysis')
                    }
                  >
                    {getFilterIcon(item.icon)}
                    <span className='ml-2'>{item.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-6 space-y-6'>
            {/* Header */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-white flex items-center gap-2'>
                    <Flame className='h-5 w-5 text-amber-500' />
                    {filter === 'all' && 'Legfrissebb posztok'}
                    {filter === 'tips' && 'Fogadási tippek'}
                    {filter === 'discussion' && 'Beszélgetések'}
                    {filter === 'analysis' && 'Elemzések'}
                  </CardTitle>
                  <div className='flex gap-2 flex-wrap'>
                    <Button
                      size='sm'
                      variant={filter === 'all' ? 'default' : 'outline'}
                      className={
                        filter === 'all'
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                      onClick={() => setFilter('all')}
                    >
                      Összes
                    </Button>
                    <Button
                      size='sm'
                      variant={filter === 'tips' ? 'default' : 'outline'}
                      className={
                        filter === 'tips'
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                      onClick={() => setFilter('tips')}
                    >
                      Tippek
                    </Button>
                    <Button
                      size='sm'
                      variant={filter === 'discussion' ? 'default' : 'outline'}
                      className={
                        filter === 'discussion'
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                      onClick={() => setFilter('discussion')}
                    >
                      Beszélgetés
                    </Button>
                    <Button
                      size='sm'
                      variant={filter === 'analysis' ? 'default' : 'outline'}
                      className={
                        filter === 'analysis'
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                      onClick={() => setFilter('analysis')}
                    >
                      Elemzések
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Posts List */}
            <div className='space-y-6'>
              {error && (
                <Card className='bg-red-900/20 border-red-700/30'>
                  <CardContent className='p-4'>
                    <p className='text-red-200'>Hiba történt a posztok betöltésekor: {error}</p>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg animate-pulse'
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-center gap-3 mb-4'>
                        <div className='h-10 w-10 bg-gray-700 rounded-full'></div>
                        <div className='flex-1'>
                          <div className='h-4 bg-gray-700 rounded w-32 mb-2'></div>
                          <div className='h-3 bg-gray-700 rounded w-24'></div>
                        </div>
                      </div>
                      <div className='h-6 bg-gray-700 rounded w-3/4 mb-3'></div>
                      <div className='h-4 bg-gray-700 rounded w-full mb-2'></div>
                      <div className='h-4 bg-gray-700 rounded w-2/3'></div>
                    </CardContent>
                  </Card>
                ))
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostUpdate={updates => handlePostUpdate(post.id, updates)}
                  />
                ))
              ) : (
                <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg'>
                  <CardContent className='p-8 text-center'>
                    <div className='text-gray-400 mb-4'>
                      <Flame className='h-12 w-12 mx-auto mb-3' />
                      <p>
                        {filter === 'all' && 'Még nincsenek posztok'}
                        {filter === 'tips' && 'Még nincsenek tippek'}
                        {filter === 'discussion' && 'Még nincsenek beszélgetések'}
                        {filter === 'analysis' && 'Még nincsenek elemzések'}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <Button
                        className='bg-amber-600 hover:bg-amber-700 text-white'
                        onClick={() => (window.location.href = '/posts/create')}
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Légy az első!
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Community Stats */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5 text-orange-500' />
                  Közösségi statisztikák
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Összes poszt</span>
                  <span className='text-white font-medium'>{posts.length}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Aktív ma</span>
                  <span className='text-white font-medium'>
                    {
                      posts.filter(p => {
                        const today = new Date();
                        const postDate = new Date(p.created_at);
                        return postDate.toDateString() === today.toDateString();
                      }).length
                    }
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Tippek</span>
                  <span className='text-white font-medium'>
                    {posts.filter(p => p.type === 'general').length}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>Beszélgetések</span>
                  <span className='text-white font-medium'>
                    {posts.filter(p => p.type === 'discussion').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className='bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30'>
              <CardHeader>
                <CardTitle className='text-white text-lg'>Tippek kezdőknek</CardTitle>
              </CardHeader>
              <CardContent className='text-sm text-blue-200 space-y-2'>
                <p>• Használd a szűrőket a releváns tartalom megtalálásához</p>
                <p>• Szavazz fel értékes posztokat</p>
                <p>• Jelöld kedvencnek a későbbihez</p>
                <p>• Jelentsd a nem megfelelő tartalmat</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
