'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

/**
 * Top hozzászólók komponens
 * A legjobb teljesítménnyel rendelkező felhasználók listája
 */
export default function TopContributors() {
  const topUsers = [
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
  ];

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Trophy className='h-5 w-5 text-yellow-500' />
          Top hozzászólók
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-3'>
          {topUsers.map(user => (
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
                <div className='text-xs text-gray-400'>{user.points.toLocaleString()} pont</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
