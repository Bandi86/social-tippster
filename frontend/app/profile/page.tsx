// Saját profil oldal - refaktorált moduláris komponensekkel
// Current user profile page - refactored with modular components
'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import UserProfileCard from '@/components/shared/UserProfileCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PostList from '@/components/user/PostList';
import { ProfileContent, ProfileSkeleton, ProfileTabs } from '@/components/user/profile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useUsers } from '@/hooks/useUsers';
import { Post } from '@/store/posts';
import { UserProfile } from '@/store/users';
import { ArrowLeft, BarChart2, DollarSign, Edit3, MessageCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CurrentUserProfilePage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Zustand hooks
  const { fetchUserProfile, isLoading: usersLoading, error: usersError } = useUsers();
  const { fetchUserPosts, isLoading: postsLoading, error: postsError } = usePosts();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (isAuthenticated && currentUser && !authLoading) {
      loadCurrentUserProfile();
    }
  }, [currentUser, isAuthenticated, authLoading]);

  useEffect(() => {
    if (userProfile && activeTab === 'posts') {
      loadUserPosts();
    }
  }, [userProfile, activeTab]);

  const loadCurrentUserProfile = async () => {
    if (!currentUser) return;

    try {
      // Get current user's detailed profile using username
      const profile = await fetchUserProfile(currentUser.username);
      setUserProfile(profile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your profile';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const loadUserPosts = async () => {
    if (!userProfile) return;

    try {
      const response = await fetchUserPosts(userProfile.user.username);
      setUserPosts(response.posts || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your posts';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  // Betöltési állapot ellenőrzése - Loading state check
  if (authLoading || !isAuthenticated) {
    return (
      <AuthGuard>
        <ProfileSkeleton />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'>
        <div className='container max-w-6xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.back()}
                className='flex items-center space-x-2 text-gray-300 hover:text-amber-400 hover:bg-gray-700/50'
              >
                <ArrowLeft className='w-4 h-4' />
                <span>Vissza</span>
              </Button>
              <div>
                <h1 className='text-2xl font-bold text-white'>Saját Profilom</h1>
                <p className='text-gray-400'>Kezeld a profilodat és tekintsd meg aktivitásaidat</p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleEditProfile}
                className='flex items-center space-x-2 border-amber-600 text-amber-400 hover:bg-amber-900/20 hover:text-amber-300'
              >
                <Edit3 className='w-4 h-4' />
                <span>Profil szerkesztése</span>
              </Button>
            </div>
          </div>

          {/* Error State */}
          {(usersError || postsError) && (
            <Card className='mb-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardContent className='pt-6'>
                <div className='text-center py-8'>
                  <p className='text-red-500 mb-4'>{usersError || postsError}</p>
                  <Button
                    onClick={loadCurrentUserProfile}
                    className='bg-amber-600 hover:bg-amber-700 text-white'
                  >
                    Próbáld újra
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {(usersLoading || postsLoading) && !(usersError || postsError) && <ProfileSkeleton />}

          {/* Content */}
          {!usersLoading && !(usersError || postsError) && userProfile && (
            <div className='space-y-6'>
              {/* User Profile Card - modular component használata */}
              <UserProfileCard
                userProfile={userProfile}
                onFollowChange={() => {
                  // Not applicable for own profile
                }}
              />

              {/* Content Tabs - modular components használata */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                  {/* ProfileTabs komponens használata */}
                  <ProfileTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    showFollowTabs={true} // Saját profil - követők/követett tabok láthatók
                    counts={{
                      posts: userProfile.stats.posts_count,
                      followers: userProfile.stats.followers_count,
                      following: userProfile.stats.following_count,
                    }}
                  />

                  {/* Tab tartalmak - ProfileContent komponenssel */}
                  <div className='mt-4 space-y-4'>
                    {/* Posztok tab */}
                    {activeTab === 'posts' && (
                      <ProfileContent
                        isLoading={postsLoading}
                        isEmpty={!postsLoading && userPosts.length === 0}
                        emptyIcon={<MessageCircle className='w-12 h-12 text-gray-500 mx-auto' />}
                        emptyTitle='Nincsenek még posztjaid'
                        emptyDescription='Még nem osztottál meg semmit. Oszd meg az első posztodat!'
                        emptyAction={{
                          label: 'Poszt létrehozása',
                          href: '/posts/create',
                        }}
                      >
                        {userPosts.length > 0 && (
                          <PostList
                            initialPosts={userPosts}
                            showCreateButton={false}
                            showFilters={false}
                            authorFilter={userProfile.user.user_id}
                          />
                        )}
                      </ProfileContent>
                    )}

                    {/* Tippek tab */}
                    {activeTab === 'tips' && (
                      <ProfileContent
                        title='Fogadási Tippek'
                        isEmpty={true}
                        emptyDescription='A tippek funkció hamarosan érkezik...'
                      />
                    )}

                    {/* Követők tab */}
                    {activeTab === 'followers' && (
                      <ProfileContent
                        title='Követők'
                        isEmpty={true}
                        emptyDescription='A követők listája hamarosan érkezik...'
                      />
                    )}

                    {/* Követettek tab */}
                    {activeTab === 'following' && (
                      <ProfileContent
                        title='Követettek'
                        isEmpty={true}
                        emptyDescription='A követett felhasználók listája hamarosan érkezik...'
                      />
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className='space-y-6'>
                  {/* Quick Actions */}
                  <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
                    <CardHeader>
                      <CardTitle className='flex items-center space-x-2 text-white'>
                        <Settings className='w-5 h-5' />
                        <span>Gyors Műveletek</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <Button
                        variant='outline'
                        className='w-full justify-start border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 hover:bg-gray-700/50'
                        onClick={handleEditProfile}
                      >
                        <Edit3 className='w-4 h-4 mr-2' />
                        Profil szerkesztése
                      </Button>
                      <Button
                        variant='outline'
                        className='w-full justify-start border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 hover:bg-gray-700/50'
                        asChild
                      >
                        <Link href='/posts/create'>
                          <MessageCircle className='w-4 h-4 mr-2' />
                          Poszt létrehozása
                        </Link>
                      </Button>
                      <Button
                        variant='outline'
                        className='w-full justify-start border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 hover:bg-gray-700/50'
                        disabled
                      >
                        <BarChart2 className='w-4 h-4 mr-2' />
                        Statisztikák megtekintése
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Profile Stats */}
                  {userProfile.stats && (
                    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
                      <CardHeader>
                        <CardTitle className='text-white'>Statisztikáid</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div className='text-center p-3 bg-gray-800/50 rounded-md'>
                            <div className='font-semibold text-lg text-white'>
                              {userProfile.stats.posts_count}
                            </div>
                            <div className='text-gray-400'>Posztok</div>
                          </div>
                          <div className='text-center p-3 bg-gray-800/50 rounded-md'>
                            <div className='font-semibold text-lg text-white'>
                              {userProfile.stats.posts_count}
                            </div>
                            <div className='text-gray-400'>Tippek</div>
                          </div>
                          <div className='text-center p-3 bg-gray-800/50 rounded-md'>
                            <div className='font-semibold text-lg text-white'>
                              {userProfile.stats.followers_count}
                            </div>
                            <div className='text-gray-400'>Követők</div>
                          </div>
                          <div className='text-center p-3 bg-gray-800/50 rounded-md'>
                            <div className='font-semibold text-lg text-white'>
                              {userProfile.stats.following_count}
                            </div>
                            <div className='text-gray-400'>Követett</div>
                          </div>
                        </div>

                        {(userProfile.stats.reputation_score > 0 ||
                          userProfile.stats.likes_received > 0) && (
                          <>
                            <div className='border-t border-gray-700 pt-4 grid grid-cols-2 gap-4'>
                              <div className='text-center p-3 bg-gray-800/50 rounded-md'>
                                <div className='font-semibold text-lg text-green-400'>
                                  {userProfile.stats.reputation_score}
                                </div>
                                <div className='text-gray-400 flex items-center justify-center gap-1'>
                                  <BarChart2 className='w-3 h-3' />
                                  Hírnév pontszám
                                </div>
                              </div>
                              <div className='text-center p-3 bg-gray-800/50 rounded-md'>
                                <div className='font-semibold text-lg text-blue-400'>
                                  {userProfile.stats.likes_received}
                                </div>
                                <div className='text-gray-400 flex items-center justify-center gap-1'>
                                  <DollarSign className='w-3 h-3' />
                                  Kapott kedvelések
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
