// Felhasználói profil oldal - moduláris komponensekkel refaktorálva
// User profile page - refactored with modular components
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PostList from '@/components/user/PostList';
import UserProfileCard from '@/components/user/UserProfileCard';
import { ProfileContent, ProfileSkeleton, ProfileTabs } from '@/components/user/profile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserPosts, Post } from '@/lib/api/posts';
import { fetchUserProfile, UserProfile } from '@/lib/api/users';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Az útvonal [id] paramétert username-ként használjuk
  const username = params.id as string;

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

  // Betöltési állapot - moduláris ProfileSkeleton használata
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto space-y-6'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='mb-6 text-gray-300 hover:text-amber-400 hover:bg-gray-700/50'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Vissza
            </Button>
            <ProfileSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='mb-6 text-gray-300 hover:text-amber-400 hover:bg-gray-700/50'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Vissza
            </Button>

            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardContent className='p-8 text-center'>
                <h2 className='text-xl font-semibold mb-2 text-white'>Felhasználó nem található</h2>
                <p className='text-gray-400 mb-4'>
                  {error || 'A keresett felhasználó nem létezik.'}
                </p>
                <Button
                  onClick={() => router.push('/')}
                  className='bg-amber-600 hover:bg-amber-700 text-white'
                >
                  Vissza a főoldalra
                </Button>{' '}
                {/* Corrected router.push to go to home ('/') instead of '/dashboard' */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Vissza gomb - Back button */}
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-6 text-gray-300 hover:text-amber-400 hover:bg-gray-700/50'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Vissza
          </Button>

          {/* Felhasználó profil kártya - moduláris komponens */}
          <UserProfileCard userProfile={userProfile} onFollowChange={handleFollowChange} />

          {/* Profil tartalom tabok - moduláris komponensekkel */}
          <div className='space-y-4'>
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showFollowTabs={false} // Más felhasználó profilján nem láthatók a follow tabok
              counts={{
                posts: userProfile.stats.posts_count,
                followers: userProfile.stats.followers_count,
                following: userProfile.stats.following_count,
              }}
            />

            {/* Tab tartalmak - ProfileContent komponenssel */}
            <div className='space-y-4'>
              {/* Posztok tab */}
              {activeTab === 'posts' && (
                <ProfileContent
                  isLoading={postsLoading}
                  isEmpty={!postsLoading && userPosts.length === 0}
                  emptyIcon={<MessageCircle className='w-12 h-12 text-gray-500 mx-auto' />}
                  emptyTitle='Nincsenek még posztok'
                  emptyDescription={`${userProfile.user.username} még nem osztott meg posztokat.`}
                >
                  {userPosts.length > 0 && (
                    <PostList
                      initialPosts={userPosts}
                      onPostUpdate={handlePostUpdate}
                      onPostDelete={handlePostDelete}
                      showFilters={false}
                      showCreateButton={false}
                    />
                  )}
                </ProfileContent>
              )}

              {/* Követők tab */}
              {activeTab === 'followers' && (
                <ProfileContent
                  title='Követők'
                  isEmpty={true}
                  emptyDescription='A követők listája hamarosan implementálva lesz.'
                />
              )}

              {/* Követettek tab */}
              {activeTab === 'following' && (
                <ProfileContent
                  title='Követettek'
                  isEmpty={true}
                  emptyDescription='A követett felhasználók listája hamarosan implementálva lesz.'
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
