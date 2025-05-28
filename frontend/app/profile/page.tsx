'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostList from '@/components/user/PostList';
import UserProfileCard from '@/components/user/UserProfileCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserPosts, Post } from '@/lib/api/posts';
import { fetchUserProfile, UserProfile } from '@/lib/api/users';
import { ArrowLeft, Edit3, MessageCircle, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CurrentUserProfilePage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setIsLoading(true);
      setError(null);

      // Get current user's detailed profile using username
      const profile = await fetchUserProfile(currentUser.username);
      setUserProfile(profile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your profile';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!userProfile) return;

    try {
      setPostsLoading(true);
      const posts = await fetchUserPosts(userProfile.user.id);
      setUserPosts(posts.posts || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your posts';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <AuthGuard>
        <div className='min-h-screen bg-background'>
          <div className='container max-w-6xl mx-auto px-4 py-8'>
            <div className='space-y-6'>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-64 w-full' />
              <Skeleton className='h-32 w-full' />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className='min-h-screen bg-background'>
        <div className='container max-w-6xl mx-auto px-4 py-8'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.back()}
                className='flex items-center space-x-2'
              >
                <ArrowLeft className='w-4 h-4' />
                <span>Back</span>
              </Button>
              <div>
                <h1 className='text-2xl font-bold'>My Profile</h1>
                <p className='text-muted-foreground'>Manage your profile and view your activity</p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleEditProfile}
                className='flex items-center space-x-2'
              >
                <Edit3 className='w-4 h-4' />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className='mb-6'>
              <CardContent className='pt-6'>
                <div className='text-center py-8'>
                  <p className='text-destructive mb-4'>{error}</p>
                  <Button onClick={loadCurrentUserProfile}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className='space-y-6'>
              <Skeleton className='h-64 w-full' />
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 space-y-4'>
                  <Skeleton className='h-12 w-full' />
                  <Skeleton className='h-32 w-full' />
                  <Skeleton className='h-32 w-full' />
                </div>
                <div className='space-y-4'>
                  <Skeleton className='h-48 w-full' />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && userProfile && (
            <div className='space-y-6'>
              {/* User Profile Card */}
              <UserProfileCard
                userProfile={userProfile}
                onFollowChange={() => {
                  // Not applicable for own profile
                }}
              />

              {/* Content Tabs */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className='grid w-full grid-cols-4'>
                      <TabsTrigger value='posts' className='flex items-center space-x-2'>
                        <MessageCircle className='w-4 h-4' />
                        <span>Posts</span>
                      </TabsTrigger>
                      <TabsTrigger value='tips' className='flex items-center space-x-2'>
                        <span>📊</span>
                        <span>Tips</span>
                      </TabsTrigger>
                      <TabsTrigger value='followers' className='flex items-center space-x-2'>
                        <Users className='w-4 h-4' />
                        <span>Followers</span>
                      </TabsTrigger>
                      <TabsTrigger value='following' className='flex items-center space-x-2'>
                        <Users className='w-4 h-4' />
                        <span>Following</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value='posts' className='space-y-4'>
                      {postsLoading ? (
                        <div className='space-y-4'>
                          <Skeleton className='h-32 w-full' />
                          <Skeleton className='h-32 w-full' />
                          <Skeleton className='h-32 w-full' />
                        </div>
                      ) : userPosts.length > 0 ? (
                        <PostList
                          initialPosts={userPosts}
                          showCreateButton={false}
                          showFilters={false}
                          authorFilter={userProfile.user.id}
                        />
                      ) : (
                        <Card>
                          <CardContent className='pt-6'>
                            <div className='text-center py-8'>
                              <MessageCircle className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                              <h3 className='text-lg font-semibold mb-2'>No posts yet</h3>
                              <p className='text-muted-foreground mb-4'>
                                You haven't posted anything yet. Share your first post!
                              </p>
                              <Button asChild>
                                <Link href='/posts/create'>Create Post</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value='tips'>
                      <Card>
                        <CardHeader>
                          <CardTitle>Betting Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-center py-8'>
                            <p className='text-muted-foreground'>
                              Tips functionality coming soon...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value='followers'>
                      <Card>
                        <CardHeader>
                          <CardTitle>Followers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-center py-8'>
                            <p className='text-muted-foreground'>Followers list coming soon...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value='following'>
                      <Card>
                        <CardHeader>
                          <CardTitle>Following</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-center py-8'>
                            <p className='text-muted-foreground'>Following list coming soon...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar */}
                <div className='space-y-6'>
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center space-x-2'>
                        <Settings className='w-5 h-5' />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <Button
                        variant='outline'
                        className='w-full justify-start'
                        onClick={handleEditProfile}
                      >
                        <Edit3 className='w-4 h-4 mr-2' />
                        Edit Profile
                      </Button>
                      <Button variant='outline' className='w-full justify-start' asChild>
                        <Link href='/posts/create'>
                          <MessageCircle className='w-4 h-4 mr-2' />
                          Create Post
                        </Link>
                      </Button>
                      <Button variant='outline' className='w-full justify-start' disabled>
                        <span className='w-4 h-4 mr-2'>📊</span>
                        View Statistics
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Profile Stats */}
                  {userProfile.stats && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div className='text-center'>
                            <div className='font-semibold text-lg'>
                              {userProfile.stats.posts_count}
                            </div>
                            <div className='text-muted-foreground'>Posts</div>
                          </div>
                          <div className='text-center'>
                            <div className='font-semibold text-lg'>
                              {userProfile.stats.tips_count}
                            </div>
                            <div className='text-muted-foreground'>Tips</div>
                          </div>
                          <div className='text-center'>
                            <div className='font-semibold text-lg'>
                              {userProfile.stats.followers_count}
                            </div>
                            <div className='text-muted-foreground'>Followers</div>
                          </div>
                          <div className='text-center'>
                            <div className='font-semibold text-lg'>
                              {userProfile.stats.following_count}
                            </div>
                            <div className='text-muted-foreground'>Following</div>
                          </div>
                        </div>

                        {(userProfile.stats.success_rate > 0 ||
                          userProfile.stats.total_profit !== 0) && (
                          <>
                            <div className='border-t pt-4'>
                              <div className='text-center'>
                                <div className='font-semibold text-lg text-green-600'>
                                  {userProfile.stats.success_rate.toFixed(1)}%
                                </div>
                                <div className='text-muted-foreground'>Success Rate</div>
                              </div>
                            </div>

                            <div className='text-center'>
                              <div
                                className={`font-semibold text-lg ${
                                  userProfile.stats.total_profit >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                ${userProfile.stats.total_profit.toFixed(2)}
                              </div>
                              <div className='text-muted-foreground'>Total Profit</div>
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
