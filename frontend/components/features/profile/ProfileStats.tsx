// Profil statisztikák komponens - felhasználó teljesítménymutatók megjelenítése
// Profile statistics component - displaying user performance metrics
'use client';

import { DollarSign, MessageCircle, Target, TrendingUp, Users } from 'lucide-react';

interface ProfileStatsData {
  followers_count: number;
  following_count: number;
  posts_count: number;
  comments_count: number;
  likes_received: number;
  reputation_score: number;
}

interface ProfileStatsProps {
  stats: ProfileStatsData;
}

/**
 * Profil statisztikák komponens - megjeleníti a felhasználó teljesítménymutatóit
 * Újrafelhasználható többféle profil megjelenítéshez
 *
 * @param stats - Statisztikai adatok
 */
export default function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4'>
      {/* Követők - Followers */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <Users className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.followers_count}</div>
        <div className='text-sm text-gray-400'>Követők</div>
      </div>

      {/* Követettek - Following */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <Users className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.following_count}</div>
        <div className='text-sm text-gray-400'>Követett</div>
      </div>

      {/* Posztok - Posts */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <MessageCircle className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.posts_count}</div>
        <div className='text-sm text-gray-400'>Posztok</div>
      </div>

      {/* Kommentek - Comments */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <Target className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.comments_count}</div>
        <div className='text-sm text-gray-400'>Kommentek</div>
      </div>

      {/* Kedvelések - Likes Received */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.likes_received}</div>
        <div className='text-sm text-gray-400'>Kedvelések</div>
      </div>

      {/* Hírnév - Reputation Score */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <DollarSign className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.reputation_score}</div>
        <div className='text-sm text-gray-400'>Hírnév</div>
      </div>
    </div>
  );
}
