'use client';

import StatItemComponent from '@/components/shared/StatItemComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchQuickStats,
  formatQuickStats,
  getCachedStats,
  setCachedStats,
  type StatsData,
} from '@/lib/stats-utils';
import { formatErrorMessage, getSkeletonItems } from '@/lib/ui-utils';
import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Napi statisztikák megjelenítése valós adatokkal
 * Daily statistics display with real data from API
 */
export default function QuickStats() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statisztikai adatok betöltése
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Először próbáljuk meg a cache-ből betölteni
        const cachedStats = getCachedStats();
        if (cachedStats) {
          setStatsData(cachedStats);
          setIsLoading(false);
          return;
        }

        // Ha nincs cache, API hívás
        const data = await fetchQuickStats();
        setStatsData(data);
        setCachedStats(data);
      } catch (err) {
        setError(formatErrorMessage(err as Error));
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();

    // Auto-refresh minden 5 percben
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = statsData ? formatQuickStats(statsData) : [];

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Zap className='h-5 w-5 text-purple-500' />
          Mai statisztikák
          {isLoading && (
            <div className='ml-auto'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500'></div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className='text-center py-4'>
            <p className='text-red-400 text-sm'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-2 text-xs text-gray-400 hover:text-white underline'
            >
              Újrapróbálás
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3 text-center'>
            {isLoading
              ? // Loading skeleton
                getSkeletonItems(4).map((_, index) => (
                  <div key={index} className='p-3 bg-gray-800/50 rounded-lg animate-pulse'>
                    <div className='h-8 bg-gray-700 rounded mb-2'></div>
                    <div className='h-3 bg-gray-700 rounded w-16 mx-auto'></div>
                  </div>
                ))
              : // Valós statisztikai adatok
                stats.map(stat => (
                  <StatItemComponent key={stat.id} stat={stat} showTrend={true} size='md' />
                ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
