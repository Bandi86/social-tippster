'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostList from '@/components/user/PostList';
import UserProfileCard from '@/components/user/UserProfileCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserPosts, Post } from '@/lib/api/posts';
import { fetchUserProfile, UserProfile } from '@/lib/api/users';
import { ArrowLeft, MessageCircle, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const username = params.id as string; // The route is [id] but we use it for username

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  useEffect(() => {
    if (userProfile && activeTab === 'posts') {
      loadUserPosts();
    }
  }, [userProfile, activeTab]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await fetchUserProfile(username);
      setUserProfile(profile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user profile';
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
    if (!userProfile?.user) return;

    try {
      setPostsLoading(true);
      const response = await fetchUserPosts(userProfile.user.username);
      setUserPosts(response.posts);
    } catch (error) {
      console.error('Failed to load user posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user posts',
        variant: 'destructive',
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollowChange = (isFollowing: boolean) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        user: {
          ...userProfile.user,
          is_following: isFollowing,
        },
        stats: {
          ...userProfile.stats,
          followers_count: userProfile.stats.followers_count + (isFollowing ? 1 : -1),
        },
      });
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setUserPosts(prevPosts =>
      prevPosts.map(post => (post.id === updatedPost.id ? updatedPost : post)),
    );
  };

  const handlePostDelete = (postId: string) => {
    setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        stats: {
          ...userProfile.stats,
          posts_count: Math.max(0, userProfile.stats.posts_count - 1),
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Back button skeleton */}
          <Skeleton className='h-10 w-24' />

          {/* Profile card skeleton */}
          <Card>
            <CardHeader>
              <div className='flex gap-6'>
                <Skeleton className='h-32 w-32 rounded-full' />
                <div className='space-y-4 flex-1'>
                  <Skeleton className='h-8 w-64' />
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-16 w-full' />
                  <div className='flex gap-2'>
                    <Skeleton className='h-9 w-24' />
                    <Skeleton className='h-9 w-24' />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-6 gap-4'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='text-center space-y-2'>
                    <Skeleton className='h-8 w-full' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs skeleton */}
          <div className='space-y-4'>
            <Skeleton className='h-10 w-64' />
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className='h-32 w-full' />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>

          <Card>
            <CardContent className='p-8 text-center'>
              <h2 className='text-xl font-semibold mb-2'>User Not Found</h2>
              <p className='text-muted-foreground mb-4'>
                {error || 'The user you are looking for does not exist.'}
              </p>
              <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Back button */}
        <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>

        {/* User Profile Card */}
        <UserProfileCard userProfile={userProfile} onFollowChange={handleFollowChange} />

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='posts'>
              <MessageCircle className='mr-2 h-4 w-4' />
              Posts ({userProfile.stats.posts_count})
            </TabsTrigger>
            <TabsTrigger value='followers'>
              <Users className='mr-2 h-4 w-4' />
              Followers ({userProfile.stats.followers_count})
            </TabsTrigger>
            <TabsTrigger value='following'>
              <Users className='mr-2 h-4 w-4' />
              Following ({userProfile.stats.following_count})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='posts' className='space-y-4'>
            {postsLoading ? (
              <div className='space-y-4'>
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className='p-6'>
                      <div className='space-y-4'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-16 w-full' />
                        <div className='flex gap-4'>
                          <Skeleton className='h-8 w-16' />
                          <Skeleton className='h-8 w-16' />
                          <Skeleton className='h-8 w-16' />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userPosts.length > 0 ? (
              <PostList
                initialPosts={userPosts}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
              />
            ) : (
              <Card>
                <CardContent className='p-8 text-center'>
                  <h3 className='text-lg font-semibold mb-2'>No Posts Yet</h3>
                  <p className='text-muted-foreground'>
                    {userProfile.user.username} hasn't shared any posts yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='followers'>
            <Card>
              <CardContent className='p-8 text-center'>
                <h3 className='text-lg font-semibold mb-2'>Followers</h3>
                <p className='text-muted-foreground'>Followers list will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='following'>
            <Card>
              <CardContent className='p-8 text-center'>
                <h3 className='text-lg font-semibold mb-2'>Following</h3>
                <p className='text-muted-foreground'>Following list will be implemented soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
