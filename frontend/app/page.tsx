'use client';

import CreatePostForm from '@/components/features/posts/CreatePostForm';
import PostList from '@/components/features/posts/PostList';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

// Root komponensek importálása
import CommunityStats from '@/components/root/CommunityStats';
//import GuestUserNotice from '@/components/root/GuestUserNotice';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // Corrected path
//import PopularTags from '@/components/root/PopularTags'; // Corrected path
//import SuggestedUsers from '@/components/root/SuggestedUsers'; // Corrected path

/**
 * Főoldal komponens
 */
export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'tips' | 'discussion' | 'analysis' | 'trending' | 'recent' | 'popular'
  >('all');
  const { isAuthenticated, user } = useAuth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Vendég felhasználói értesítő */}
      {/* {!isAuthenticated && <GuestUserNotice />} */}

      {/* Fő konténer */}
      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Bal oldali menü */}
          <div className='lg:col-span-3 space-y-6'>
            <UserProfileQuickView />
            <MainNavigation isAuthenticated={isAuthenticated} />
            <QuickActions onCreatePost={() => setShowCreateForm(!showCreateForm)} />
            <CommunityStats />
          </div>

          {/* Fő tartalom */}
          <div className='lg:col-span-6 space-y-6'>
            <WelcomeHeader />
            <PostCreationArea onCreatePost={() => setShowCreateForm(true)} />

            {showCreateForm && isAuthenticated && (
              <CreatePostForm
                onSubmit={() => setShowCreateForm(false)}
                onCancel={() => setShowCreateForm(false)}
              />
            )}

            <PostFeedFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <PostList showCreateButton={false} showFilters={false} />
          </div>

          {/* Jobb oldali menü */}
          <div className='lg:col-span-3 space-y-6'>
            <TrendingTopics />

            {/* Élő meccsek - mostantól minden esetben megjelenik, de kezeli az auth state-et */}
            <LiveMatches />

            <TopContributors />
            <RecentActivity />
            <QuickStats />
          </div>
        </div>
      </div>
    </div>
  );
}
