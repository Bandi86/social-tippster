'use client';

import StatRow from '@/components/shared/StatRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchRealTimeCommunityStats,
  formatCommunityStats,
  getCachedCommunityStats,
  setCachedCommunityStats,
  type RealTimeCommunityStats,
} from '@/lib/community-utils';
import { formatErrorMessage, getSkeletonItems } from '@/lib/ui-utils';
import { Activity, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Közösségi statisztikák komponens valós adatokkal
 * Community statistics component with real-time data
 */
export default function CommunityStats() {
  const [communityData, setCommunityData] = useState<RealTimeCommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Közösségi statisztikák betöltése
  const loadCommunityStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Cache ellenőrzése (csak ha nem refresh)
      if (!isRefresh) {
        const cachedData = getCachedCommunityStats();
        if (cachedData) {
          setCommunityData(cachedData);
          setIsLoading(false);
          return;
        }
      }

      // API hívás
      const data = await fetchRealTimeCommunityStats();
      setCommunityData(data);
      setCachedCommunityStats(data);
    } catch (err) {
      setError(formatErrorMessage(err as Error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCommunityStats();

    // Auto-refresh minden 3 percben
    const interval = setInterval(() => loadCommunityStats(true), 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadCommunityStats(true);
  };

  const stats = communityData ? formatCommunityStats(communityData) : [];

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Közösség
          <div className='ml-auto'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='text-gray-400 hover:text-white transition-colors p-1'
              title='Frissítés'
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {error ? (
          <div className='text-center py-4'>
            <p className='text-red-400 text-sm'>{error}</p>
            <button
              onClick={() => loadCommunityStats()}
              className='mt-2 text-xs text-gray-400 hover:text-white underline'
            >
              Újrapróbálás
            </button>
          </div>
        ) : (
          <div className='text-sm space-y-2'>
            {isLoading
              ? // Loading skeleton
                getSkeletonItems(4).map((_, index) => (
                  <div key={index} className='flex justify-between items-center animate-pulse'>
                    <div className='h-4 bg-gray-700 rounded w-1/2'></div>
                    <div className='h-4 bg-gray-700 rounded w-1/4'></div>
                  </div>
                ))
              : // Valós statisztikák
                stats.map(stat => (
                  <StatRow
                    key={stat.id}
                    label={stat.label}
                    value={stat.value}
                    color={stat.color}
                    showIndicator={stat.showIndicator}
                    indicatorColor={stat.indicatorColor}
                    trend={stat.trend}
                  />
                ))}

            {/* Utolsó frissítés időpontja */}
            {communityData && !isLoading && (
              <div className='mt-3 pt-2 border-t border-gray-700'>
                <p className='text-xs text-gray-500 text-center'>
                  Utoljára frissítve: {communityData.lastUpdated.toLocaleTimeString('hu-HU')}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
