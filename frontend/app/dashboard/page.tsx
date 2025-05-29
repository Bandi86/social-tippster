'use client';

import {
  BarChart3,
  Bookmark,
  Crown,
  MessageSquare,
  Plus,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostList from '@/components/user/PostList';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import Link from 'next/link';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { fetchPosts, fetchFeaturedPosts, featuredPosts, totalPosts } = usePosts();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalTips: 0,
    successRate: 0,
  });

  useEffect(() => {
    loadFeaturedPosts();
    loadDashboardStats();
  }, []);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalPosts: totalPosts,
    }));
  }, [totalPosts]);

  const loadFeaturedPosts = async () => {
    try {
      await fetchFeaturedPosts();
    } catch (error) {
      console.error('Failed to load featured posts:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Load stats from posts API - this would be better as a dedicated stats endpoint
      await fetchPosts({ limit: 1 });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent'>
              Dashboard
            </h1>
            <p className='text-gray-400 mt-1'>
              {isAuthenticated
                ? `Üdvözöljük vissza, ${user?.username || 'Felhasználó'}!`
                : 'Fedezze fel a legjobb sportfogadási tippeket!'}
            </p>
          </div>

          {isAuthenticated && (
            <div className='flex gap-3 mt-4 md:mt-0'>
              <Link href='/posts/create'>
                <Button className='bg-amber-600 hover:bg-amber-700'>
                  <Plus className='h-4 w-4 mr-2' />
                  Új poszt
                </Button>
              </Link>
              <Link href='/profile'>
                <Button
                  variant='outline'
                  className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
                >
                  Profil
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-green-200'>Összes poszt</CardTitle>
              <MessageSquare className='h-4 w-4 text-green-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-400'>{stats.totalPosts}</div>
              <p className='text-xs text-green-200/70'>Aktív közösség</p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-blue-200'>
                Aktív felhasználók
              </CardTitle>
              <Users className='h-4 w-4 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-400'>{stats.totalUsers}</div>
              <p className='text-xs text-blue-200/70'>Tipperek közössége</p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-purple-200'>Sikeres tippek</CardTitle>
              <Target className='h-4 w-4 text-purple-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-400'>{stats.totalTips}</div>
              <p className='text-xs text-purple-200/70'>Nyerő előrejelzések</p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-amber-200'>
                Átlagos sikerarány
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-amber-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-400'>{stats.successRate}%</div>
              <p className='text-xs text-amber-200/70'>Közösségi átlag</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
                <Crown className='h-5 w-5 text-amber-400' />
                Kiemelt posztok
              </h2>
              <Link href='/posts?featured=true'>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
                >
                  Összes kiemelt
                </Button>
              </Link>
            </div>

            <div className='grid gap-6'>
              {featuredPosts.map(post => (
                <Card
                  key={post.id}
                  className='bg-gradient-to-br from-gray-900 to-gray-800 border-amber-600/50'
                >
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between mb-3'>
                      <Badge className='bg-amber-600/20 text-amber-400 border-amber-600'>
                        <Crown className='h-3 w-3 mr-1' />
                        Kiemelt
                      </Badge>
                      <span className='text-sm text-gray-400'>{post.type}</span>
                    </div>

                    <Link href={`/posts/${post.id}`}>
                      <h3 className='text-lg font-semibold text-white hover:text-amber-400 transition-colors mb-2'>
                        {post.title}
                      </h3>
                    </Link>

                    {post.excerpt && (
                      <p className='text-gray-300 mb-3 line-clamp-2'>{post.excerpt}</p>
                    )}

                    <div className='flex items-center justify-between text-sm text-gray-400'>
                      <span>@{post.author?.username}</span>
                      <div className='flex items-center gap-4'>
                        <span>{post.likes_count} kedvelés</span>
                        <span>{post.comments_count} komment</span>
                        <span>{post.views_count} megtekintés</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue='feed' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-3 bg-gray-800 border-gray-700'>
            <TabsTrigger
              value='feed'
              className='data-[state=active]:bg-amber-600 data-[state=active]:text-white'
            >
              <TrendingUp className='h-4 w-4 mr-2' />
              Főoldal
            </TabsTrigger>
            <TabsTrigger
              value='tips'
              className='data-[state=active]:bg-amber-600 data-[state=active]:text-white'
            >
              <Target className='h-4 w-4 mr-2' />
              Tippek
            </TabsTrigger>
            {isAuthenticated && (
              <TabsTrigger
                value='bookmarks'
                className='data-[state=active]:bg-amber-600 data-[state=active]:text-white'
              >
                <Bookmark className='h-4 w-4 mr-2' />
                Könyvjelzők
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='feed' className='space-y-6'>
            <PostList showCreateButton={true} showFilters={true} />
          </TabsContent>

          <TabsContent value='tips' className='space-y-6'>
            <PostList showCreateButton={true} showFilters={true} typeFilter='tip' />
          </TabsContent>

          {isAuthenticated && (
            <TabsContent value='bookmarks' className='space-y-6'>
              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
                <CardContent className='p-8 text-center'>
                  <Bookmark className='h-12 w-12 mx-auto mb-3 text-gray-400' />
                  <p className='text-gray-400'>A könyvjelzők funkció hamarosan érkezik!</p>
                  <p className='text-sm text-gray-500 mt-2'>
                    Itt fogja látni az összes mentett posztját.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Welcome message for non-authenticated users */}
        {!isAuthenticated && (
          <Card className='bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700 mt-8'>
            <CardContent className='p-6 text-center'>
              <h3 className='text-lg font-semibold text-amber-400 mb-2'>
                Csatlakozzon a közösséghez!
              </h3>
              <p className='text-gray-300 mb-4'>
                Regisztráljon, hogy saját tippeket osszon meg, kommentáljon és kövesse kedvenc
                tippereit!
              </p>
              <div className='flex gap-3 justify-center'>
                <Link href='/auth/register'>
                  <Button className='bg-amber-600 hover:bg-amber-700'>Regisztráció</Button>
                </Link>
                <Link href='/auth/login'>
                  <Button
                    variant='outline'
                    className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
                  >
                    Bejelentkezés
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
