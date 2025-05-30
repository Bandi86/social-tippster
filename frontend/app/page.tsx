'use client';

import CreatePostForm from '@/components/user/posts/CreatePostForm';
import PostList from '@/components/user/PostList';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

// Root komponensek importálása
import CommunityStats from '@/components/root/CommunityStats';
import GuestUserNotice from '@/components/root/GuestUserNotice';
import LiveMatches from '@/components/root/LiveMatches';
import MainNavigation from '@/components/root/MainNavigation';
import PostCreationArea from '@/components/root/PostCreationArea';
import PostFeedFilters from '@/components/root/PostFeedFilters';
import QuickActions from '@/components/root/QuickActions';
import QuickStats from '@/components/root/QuickStats';
import RecentActivity from '@/components/root/RecentActivity';
import TopContributors from '@/components/root/TopContributors';
import TrendingTopics from '@/components/root/TrendingTopics';
import UserProfileQuickView from '@/components/root/UserProfileQuickView';
import WelcomeHeader from '@/components/root/WelcomeHeader';

/**
 * Főoldal komponens
 * A Social Tippster alkalmazás főoldala, amely tartalmazza a fő tartalmat,
 * oldalmenüket, és különböző szekciókra van bontva a jobb karbantarthatóság érdekében
 */
export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAuthenticated, user } = useAuth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Vendég felhasználói értesítő */}
      {!isAuthenticated && <GuestUserNotice />}

      {/* Fő konténer */}
      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Bal oldali menü */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Felhasználói profil gyors áttekintő */}
            {isAuthenticated && user && <UserProfileQuickView user={user} />}

            {/* Fő navigáció */}
            <MainNavigation isAuthenticated={isAuthenticated} />

            {/* Gyors műveletek */}
            <QuickActions
              isAuthenticated={isAuthenticated}
              onCreatePost={() => setShowCreateForm(!showCreateForm)}
            />

            {/* Közösségi statisztikák */}
            <CommunityStats />
          </div>

          {/* Fő tartalom */}
          <div className='lg:col-span-6 space-y-6'>
            {/* Üdvözlő fejléc */}
            <WelcomeHeader isAuthenticated={isAuthenticated} user={user || undefined} />

            {/* Poszt létrehozási terület */}
            <PostCreationArea
              isAuthenticated={isAuthenticated}
              user={user || undefined}
              onCreatePost={() => setShowCreateForm(true)}
            />

            {/* Kibővíthető poszt létrehozó űrlap */}
            {showCreateForm && isAuthenticated && (
              <CreatePostForm
                onSubmit={() => setShowCreateForm(false)}
                onCancel={() => setShowCreateForm(false)}
              />
            )}

            {/* Poszt szűrők */}
            <PostFeedFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Poszt lista */}
            <PostList showCreateButton={false} showFilters={false} />
          </div>

          {/* Jobb oldali menü */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Trending témák */}
            <TrendingTopics />

            {/* Élő meccsek */}
            <LiveMatches />

            {/* Top hozzászólók */}
            <TopContributors />

            {/* Legutóbbi aktivitás */}
            <RecentActivity />

            {/* Napi statisztikák */}
            <QuickStats />
          </div>
        </div>
      </div>
    </div>
  );
}
