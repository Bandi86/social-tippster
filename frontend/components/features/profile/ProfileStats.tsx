// Profil statisztikák komponens - felhasználó teljesítménymutatók megjelenítése
// Profile statistics component - displaying user performance metrics
'use client';

import { DollarSign, MessageCircle, Target, TrendingUp, Users } from 'lucide-react';

interface ProfileStatsData {
  followers_count: number;
  following_count: number;
  posts_count: number;
  tips_count: number;
  success_rate: number;
  total_profit: number;
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

      {/* Tippek - Tips */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <Target className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.tips_count}</div>
        <div className='text-sm text-gray-400'>Tippek</div>
      </div>

      {/* Sikerességi ráta - Success Rate */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>{stats.success_rate}%</div>
        <div className='text-sm text-gray-400'>Sikerességi ráta</div>
      </div>

      {/* Profit - Total Profit */}
      <div className='text-center'>
        <div className='flex items-center justify-center gap-1 text-gray-400 mb-1'>
          <DollarSign className='h-4 w-4' />
        </div>
        <div className='text-2xl font-bold text-white'>
          {stats.total_profit >= 0 ? '+' : ''}
          {stats.total_profit}
        </div>
        <div className='text-sm text-gray-400'>Profit</div>
      </div>
    </div>
  );
}
