'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDisplayNumber, getAvatarFallback } from '@/lib/ui-utils';
import { useAuthStore } from '@/store/auth';
import { Award, Crown, Settings, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

// Felhasználói statisztikák interface
interface UserStats {
  postsCount: number;
  accuracy: number;
  totalPoints: number;
  rank: number;
  activeTips: number;
  winStreak: number;
}

// Mock API függvény a felhasználói statisztikákhoz
const fetchUserStats = async (userId: string): Promise<UserStats> => {
  // TODO: Valódi API hívás implementálása
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        postsCount: Math.floor(Math.random() * 50) + 10,
        accuracy: Math.floor(Math.random() * 30) + 70,
        totalPoints: Math.floor(Math.random() * 5000) + 1000,
        rank: Math.floor(Math.random() * 100) + 1,
        activeTips: Math.floor(Math.random() * 10) + 2,
        winStreak: Math.floor(Math.random() * 10) + 1,
      });
    }, 200);
  });
};

/**
 * Felhasználói profil gyors áttekintő komponens Zustand store-ral
 * Bejelentkezett felhasználók számára jeleníti meg az alapvető profil információkat
 */
export default function UserProfileQuickView() {
  const { user, isAuthenticated } = useAuthStore();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setIsLoading(true);
      fetchUserStats(user.id)
        .then(setUserStats)
        .catch(() => setUserStats(null))
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, user?.id]);

  // Ha nincs bejelentkezett felhasználó, ne jelenjen meg a komponens
  if (!isAuthenticated || !user) {
    return null;
  }

  const getUserBadge = () => {
    if (user.role === 'admin') {
      return (
        <Badge variant='default' className='bg-red-600 hover:bg-red-700'>
          <Crown className='h-3 w-3 mr-1' />
          Admin
        </Badge>
      );
    }

    if (userStats && userStats.rank <= 10) {
      return (
        <Badge variant='default' className='bg-amber-600 hover:bg-amber-700'>
          <Award className='h-3 w-3 mr-1' />
          Top 10
        </Badge>
      );
    }

    return (
      <Badge variant='secondary' className='bg-gray-600 hover:bg-gray-700'>
        Felhasználó
      </Badge>
    );
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 relative'>
      <CardContent className='p-4'>
        {/* Felhasználói profil fejléc */}
        <div className='flex items-center gap-3 mb-4'>
          <Avatar className='h-12 w-12 ring-2 ring-amber-500/20'>
            <AvatarImage src={user.profile_image} alt={user.username} />
            <AvatarFallback className='bg-amber-600 text-white font-semibold'>
              {getAvatarFallback(user.username || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <h3 className='font-semibold text-white'>{user.username}</h3>
              {getUserBadge()}
            </div>
            {userStats && (
              <p className='text-xs text-gray-400'>
                #{userStats.rank} rangsor • {formatDisplayNumber(userStats.totalPoints)} pont
              </p>
            )}
          </div>
          <button
            className='text-gray-400 hover:text-white transition-colors p-1'
            title='Profil beállítások'
          >
            <Settings className='h-4 w-4' />
          </button>
        </div>

        {/* Statisztikák */}
        <div className='grid grid-cols-2 gap-2 text-xs'>
          {isLoading ? (
            // Loading skeleton
            <>
              <div className='text-center p-2 bg-gray-800 rounded animate-pulse'>
                <div className='h-4 bg-gray-700 rounded mb-1'></div>
                <div className='h-3 bg-gray-700 rounded'></div>
              </div>
              <div className='text-center p-2 bg-gray-800 rounded animate-pulse'>
                <div className='h-4 bg-gray-700 rounded mb-1'></div>
                <div className='h-3 bg-gray-700 rounded'></div>
              </div>
            </>
          ) : userStats ? (
            <>
              <div className='text-center p-2 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors'>
                <div className='text-amber-400 font-semibold'>{userStats.postsCount}</div>
                <div className='text-gray-400'>Posztok</div>
              </div>
              <div className='text-center p-2 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors'>
                <div className={`font-semibold ${getAccuracyColor(userStats.accuracy)}`}>
                  {userStats.accuracy}%
                </div>
                <div className='text-gray-400'>Pontosság</div>
              </div>
              <div className='text-center p-2 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors'>
                <div className='text-blue-400 font-semibold'>{userStats.activeTips}</div>
                <div className='text-gray-400'>Aktív tippek</div>
              </div>
              <div className='text-center p-2 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors'>
                <div className='text-purple-400 font-semibold flex items-center justify-center gap-1'>
                  <TrendingUp className='h-3 w-3' />
                  {userStats.winStreak}
                </div>
                <div className='text-gray-400'>Győzelem</div>
              </div>
            </>
          ) : (
            // Fallback default stats
            <>
              <div className='text-center p-2 bg-gray-800/50 rounded'>
                <div className='text-amber-400 font-semibold'>-</div>
                <div className='text-gray-400'>Posztok</div>
              </div>
              <div className='text-center p-2 bg-gray-800/50 rounded'>
                <div className='text-green-400 font-semibold'>-</div>
                <div className='text-gray-400'>Pontosság</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
