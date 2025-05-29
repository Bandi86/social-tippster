'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreatePostForm from '@/components/user/CreatePostForm';
import PostList from '@/components/user/PostList';
import { useAuth } from '@/hooks/useAuth';
import {
  Activity,
  Bell,
  Bookmark,
  BookOpen,
  Calendar,
  Flame,
  Home as HomeIcon,
  MessageSquare,
  Plus,
  Star,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAuthenticated, user } = useAuth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Guest User Notice */}
      {!isAuthenticated && (
        <div className='bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-b border-amber-700/30'>
          <div className='container mx-auto px-4 py-3'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2 text-amber-300'>
                <span>👋</span>
                <span>Üdvözöljük! Böngéssze az összes tartalmat regisztráció nélkül.</span>
              </div>
              <div className='flex items-center gap-2'>
                <Link href='/auth/login'>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='text-amber-400 hover:text-amber-300 hover:bg-amber-900/50'
                  >
                    Bejelentkezés
                  </Button>
                </Link>
                <Link href='/auth/register'>
                  <Button size='sm' className='bg-amber-600 hover:bg-amber-700 text-white'>
                    Regisztráció
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Sidebar - Enhanced Navigation */}
          <div className='lg:col-span-3 space-y-6'>
            {/* User Profile Quick View */}
            {isAuthenticated && user && (
              <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-12 w-12'>
                      <AvatarImage src={user.profile_image} />
                      <AvatarFallback className='bg-amber-600 text-white'>
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-white'>{user.username}</h3>
                      <p className='text-sm text-gray-400'>
                        {user.role === 'admin' ? 'Admin' : 'Felhasználó'}
                      </p>
                    </div>
                  </div>
                  <div className='mt-4 grid grid-cols-2 gap-2 text-xs'>
                    <div className='text-center p-2 bg-gray-800 rounded'>
                      <div className='text-amber-400 font-semibold'>12</div>
                      <div className='text-gray-400'>Posztok</div>
                    </div>
                    <div className='text-center p-2 bg-gray-800 rounded'>
                      <div className='text-green-400 font-semibold'>89%</div>
                      <div className='text-gray-400'>Pontosság</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Navigation */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <HomeIcon className='h-5 w-5' />
                  Navigáció
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link href='/'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
                  >
                    <HomeIcon className='h-4 w-4 mr-3' />
                    Főoldal
                  </Button>
                </Link>
                <Link href='/posts'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
                  >
                    <TrendingUp className='h-4 w-4 mr-3' />
                    Tippek
                  </Button>
                </Link>
                <Link href='/discussions'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
                  >
                    <MessageSquare className='h-4 w-4 mr-3' />
                    Beszélgetések
                  </Button>
                </Link>
                <Link href='/news'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
                  >
                    <BookOpen className='h-4 w-4 mr-3' />
                    Hírek
                  </Button>
                </Link>
                <Link href='/analysis'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
                  >
                    <Star className='h-4 w-4 mr-3' />
                    Elemzések
                  </Button>
                </Link>
                {isAuthenticated && (
                  <>
                    <Link href='/bookmarks'>
                      <Button
                        variant='ghost'
                        className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
                      >
                        <Bookmark className='h-4 w-4 mr-3' />
                        Mentett posztok
                      </Button>
                    </Link>
                    <Link href='/profile'>
                      <Button
                        variant='ghost'
                        className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
                      >
                        <User className='h-4 w-4 mr-3' />
                        Profilom
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <Zap className='h-5 w-5' />
                  Gyors műveletek
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className='w-full bg-amber-600 hover:bg-amber-700'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Új poszt
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full border-amber-600 text-amber-400 hover:bg-amber-900/20'
                    >
                      <Calendar className='h-4 w-4 mr-2' />
                      Események
                    </Button>
                  </>
                ) : (
                  <div className='text-center text-gray-400 text-sm p-4 space-y-4'>
                    <div className='space-y-2'>
                      <p className='text-gray-300 font-medium'>Bejelentkezés után:</p>
                      <div className='space-y-1 text-xs text-gray-400'>
                        <p className='flex items-center gap-2'>
                          <Plus className='h-3 w-3' />
                          Új posztok létrehozása
                        </p>
                        <p className='flex items-center gap-2'>
                          <MessageSquare className='h-3 w-3' />
                          Kommentelés és válaszadás
                        </p>
                        <p className='flex items-center gap-2'>
                          <TrendingUp className='h-3 w-3' />
                          Szavazás és értékelés
                        </p>
                        <p className='flex items-center gap-2'>
                          <Bookmark className='h-3 w-3' />
                          Posztok mentése
                        </p>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Link href='/auth/login'>
                        <Button className='w-full bg-amber-600 hover:bg-amber-700 mb-2'>
                          Bejelentkezés
                        </Button>
                      </Link>
                      <Link href='/auth/register'>
                        <Button
                          variant='outline'
                          className='w-full border-amber-600 text-amber-400'
                        >
                          Új fiók létrehozása
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Közösség
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='text-sm text-gray-300 space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                      Online felhasználók
                    </span>
                    <span className='text-green-400 font-semibold'>1,234</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Összes tag:</span>
                    <span className='text-amber-400 font-semibold'>12,567</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Mai posztok:</span>
                    <span className='text-blue-400 font-semibold'>89</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Aktív tippek:</span>
                    <span className='text-purple-400 font-semibold'>156</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-6 space-y-6'>
            {/* Welcome Header */}
            <Card className='bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500'>
              <CardContent className='p-6 text-center'>
                <h1 className='text-3xl font-bold text-white mb-2'>
                  {isAuthenticated
                    ? `Üdvözlünk vissza, ${user?.username}!`
                    : 'Üdvözlünk a Social Tippster-ben!'}
                </h1>
                <p className='text-amber-100'>
                  {isAuthenticated
                    ? 'Oszd meg és beszéld meg a legjobb tippeket a közösségünkkel'
                    : 'Fedezd fel az összes tippet, elemzést és beszélgetést - regisztráció nélkül is!'}
                </p>
              </CardContent>
            </Card>

            {/* Always Visible Post Creation Area */}
            {isAuthenticated ? (
              <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-4 mb-4'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={user?.profile_image} />
                      <AvatarFallback className='bg-amber-600 text-white'>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      variant='outline'
                      className='flex-1 justify-start text-gray-400 border-gray-600 hover:border-amber-600 hover:bg-gray-800'
                    >
                      Mit gondolsz erről a meccsről?
                    </Button>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      variant='ghost'
                      size='sm'
                      className='text-gray-400 hover:text-amber-400 hover:bg-gray-800'
                    >
                      <MessageSquare className='h-4 w-4 mr-2' />
                      Poszt
                    </Button>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      variant='ghost'
                      size='sm'
                      className='text-gray-400 hover:text-amber-400 hover:bg-gray-800'
                    >
                      <TrendingUp className='h-4 w-4 mr-2' />
                      Tipp
                    </Button>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      variant='ghost'
                      size='sm'
                      className='text-gray-400 hover:text-amber-400 hover:bg-gray-800'
                    >
                      <BookOpen className='h-4 w-4 mr-2' />
                      Elemzés
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
                <CardContent className='p-6 text-center'>
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    Fedezd fel a legjobb tippeket!
                  </h3>
                  <p className='text-gray-400 mb-4'>
                    Böngészd az összes posztot és elemzést. Jelentkezz be, hogy te is posztolhass,
                    kommentelj és szavazz!
                  </p>
                  <div className='flex gap-3 justify-center'>
                    <Link href='/auth/login'>
                      <Button className='bg-amber-600 hover:bg-amber-700'>Bejelentkezés</Button>
                    </Link>
                    <Link href='/auth/register'>
                      <Button
                        variant='outline'
                        className='border-amber-600 text-amber-400 hover:bg-amber-900/20'
                      >
                        Regisztráció
                      </Button>
                    </Link>
                  </div>
                  <div className='mt-4 text-xs text-gray-500'>
                    <p>✨ Minden tartalom megtekinthető regisztráció nélkül</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expandable Create Post Form */}
            {showCreateForm && isAuthenticated && (
              <CreatePostForm
                onSubmit={() => setShowCreateForm(false)}
                onCancel={() => setShowCreateForm(false)}
              />
            )}

            {/* Post Feed with Filters */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg text-white flex items-center gap-2'>
                    <Flame className='h-5 w-5 text-amber-500' />
                    Legfrissebb posztok
                  </CardTitle>
                  <div className='flex gap-2'>
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                      size='sm'
                      onClick={() => setSelectedCategory('all')}
                      className={
                        selectedCategory === 'all'
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }
                    >
                      Összes
                    </Button>
                    <Button
                      variant={selectedCategory === 'tips' ? 'default' : 'ghost'}
                      size='sm'
                      onClick={() => setSelectedCategory('tips')}
                      className={
                        selectedCategory === 'tips'
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }
                    >
                      Tippek
                    </Button>
                    <Button
                      variant={selectedCategory === 'discussion' ? 'default' : 'ghost'}
                      size='sm'
                      onClick={() => setSelectedCategory('discussion')}
                      className={
                        selectedCategory === 'discussion'
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }
                    >
                      Beszélgetés
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Post Feed */}
            <PostList showCreateButton={false} showFilters={false} />
          </div>

          {/* Right Sidebar */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Trending Topics */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <Flame className='h-5 w-5 text-orange-500' />
                  Trending témák
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-3'>
                  {[
                    { tag: '#premier-league', posts: 234, trend: '+12%' },
                    { tag: '#NBA', posts: 189, trend: '+8%' },
                    { tag: '#tenisz', posts: 156, trend: '+5%' },
                    { tag: '#formula1', posts: 123, trend: '+15%' },
                    { tag: '#labdarugas', posts: 98, trend: '+3%' },
                  ].map((topic, index) => (
                    <div key={topic.tag} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-bold text-gray-500'>#{index + 1}</span>
                        <Badge
                          variant='secondary'
                          className='bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                        >
                          {topic.tag}
                        </Badge>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm text-amber-400 font-semibold'>{topic.posts}</div>
                        <div className='text-xs text-green-400'>{topic.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Matches */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <Activity className='h-5 w-5 text-red-500' />
                  Élő meccsek
                  <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1'></div>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-3'>
                  <div className='p-3 bg-gray-800/50 rounded-lg border border-gray-700'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-semibold text-white'>
                        Manchester United vs Liverpool
                      </span>
                      <Badge className='bg-red-600 text-white'>LIVE</Badge>
                    </div>
                    <div className='text-center'>
                      <span className='text-2xl font-bold text-amber-400'>2 - 1</span>
                    </div>
                    <div className='text-xs text-gray-400 text-center mt-2'>
                      67' - Premier League
                    </div>
                  </div>

                  <div className='p-3 bg-gray-800/50 rounded-lg border border-gray-700'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-semibold text-white'>Lakers vs Warriors</span>
                      <Badge className='bg-red-600 text-white'>LIVE</Badge>
                    </div>
                    <div className='text-center'>
                      <span className='text-2xl font-bold text-amber-400'>89 - 92</span>
                    </div>
                    <div className='text-xs text-gray-400 text-center mt-2'>Q3 8:45 - NBA</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <Trophy className='h-5 w-5 text-yellow-500' />
                  Top hozzászólók
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-3'>
                  {[
                    {
                      rank: 1,
                      name: 'ProTipper',
                      points: 2456,
                      badge: '🏆',
                      color: 'from-yellow-400 to-yellow-600',
                    },
                    {
                      rank: 2,
                      name: 'SportsFan',
                      points: 1987,
                      badge: '🥈',
                      color: 'from-gray-400 to-gray-600',
                    },
                    {
                      rank: 3,
                      name: 'BetMaster',
                      points: 1654,
                      badge: '🥉',
                      color: 'from-amber-600 to-amber-800',
                    },
                    {
                      rank: 4,
                      name: 'AnalysisKing',
                      points: 1432,
                      badge: '⭐',
                      color: 'from-blue-500 to-blue-600',
                    },
                    {
                      rank: 5,
                      name: 'TippGuru',
                      points: 1298,
                      badge: '🔥',
                      color: 'from-purple-500 to-purple-600',
                    },
                  ].map(user => (
                    <div key={user.rank} className='flex items-center gap-3'>
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${user.color} rounded-full flex items-center justify-center text-sm font-bold text-white`}
                      >
                        {user.rank}
                      </div>
                      <div className='flex-1'>
                        <div className='text-sm font-medium text-white flex items-center gap-1'>
                          {user.name}
                          <span className='text-xs'>{user.badge}</span>
                        </div>
                        <div className='text-xs text-gray-400'>
                          {user.points.toLocaleString()} pont
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <Bell className='h-5 w-5 text-blue-500' />
                  Legutóbbi aktivitás
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-start gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-blue-600 text-white text-xs'>J</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='text-gray-300'>
                        <span className='text-white font-medium'>János</span> kommentelt a
                        <span className='text-amber-400'> "Chelsea vs Arsenal"</span> posztra
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>5 perc</div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-green-600 text-white text-xs'>P</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='text-gray-300'>
                        <span className='text-white font-medium'>Péter</span> új tippet oszott meg
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>12 perc</div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-purple-600 text-white text-xs'>
                        A
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='text-gray-300'>
                        <span className='text-white font-medium'>Anna</span> lájkolta a
                        <span className='text-amber-400'> "NBA előrejelzések"</span> posztot
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>18 perc</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-white flex items-center gap-2'>
                  <Zap className='h-5 w-5 text-purple-500' />
                  Mai statisztikák
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-3 text-center'>
                  <div className='p-3 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-lg'>
                    <div className='text-2xl font-bold text-amber-400'>89</div>
                    <div className='text-xs text-gray-400'>Új posztok</div>
                  </div>
                  <div className='p-3 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg'>
                    <div className='text-2xl font-bold text-green-400'>156</div>
                    <div className='text-xs text-gray-400'>Aktív tippek</div>
                  </div>
                  <div className='p-3 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg'>
                    <div className='text-2xl font-bold text-blue-400'>1.2K</div>
                    <div className='text-xs text-gray-400'>Online</div>
                  </div>
                  <div className='p-3 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg'>
                    <div className='text-2xl font-bold text-purple-400'>87%</div>
                    <div className='text-xs text-gray-400'>Pontosság</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
