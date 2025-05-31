'use client';

import ActivityItemComponent from '@/components/shared/ActivityItemComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchRecentActivity,
  getCachedActivity,
  setCachedActivity,
  type ActivityData,
} from '@/lib/activity-utils';
import { formatErrorMessage, getSkeletonItems } from '@/lib/ui-utils';
import { Bell, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Legutóbbi aktivitások megjelenítése valós adatokkal
 * Recent activities display with real data from API
 */
export default function RecentActivity() {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aktivitások betöltése
  const loadActivity = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Először próbáljuk meg a cache-ből betölteni (csak ha nem refresh)
      if (!isRefresh) {
        const cachedActivity = getCachedActivity();
        if (cachedActivity) {
          setActivityData(cachedActivity);
          setIsLoading(false);
          return;
        }
      }

      // API hívás
      const data = await fetchRecentActivity();
      setActivityData(data);
      setCachedActivity(data);
    } catch (err) {
      setError(formatErrorMessage(err as Error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivity();

    // Auto-refresh minden 2 percben
    const interval = setInterval(() => loadActivity(true), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadActivity(true);
  };

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Bell className='h-5 w-5 text-blue-500' />
          Legutóbbi aktivitás
          <div className='ml-auto flex items-center gap-2'>
            {activityData && (
              <span className='text-xs text-gray-400'>
                {activityData.recent.length} / {activityData.totalCount}
              </span>
            )}
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
              onClick={() => loadActivity()}
              className='mt-2 text-xs text-gray-400 hover:text-white underline'
            >
              Újrapróbálás
            </button>
          </div>
        ) : (
          <div className='space-y-3'>
            {isLoading ? (
              // Loading skeleton
              getSkeletonItems(5).map((_, index) => (
                <div key={index} className='flex items-start gap-3 animate-pulse'>
                  <div className='h-8 w-8 bg-gray-700 rounded-full'></div>
                  <div className='flex-1 space-y-1'>
                    <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                    <div className='h-3 bg-gray-700 rounded w-1/4'></div>
                  </div>
                </div>
              ))
            ) : activityData?.recent && activityData.recent.length > 0 ? (
              // Valós aktivitások
              activityData.recent.slice(0, 6).map(activity => (
                <ActivityItemComponent
                  key={activity.id}
                  activity={activity}
                  size='md'
                  onClick={() => {
                    // TODO: Navigáció az aktivitás céljához
                    console.log('Activity clicked:', activity);
                  }}
                />
              ))
            ) : (
              // Üres állapot
              <div className='text-center py-8'>
                <Bell className='h-12 w-12 text-gray-600 mx-auto mb-3' />
                <p className='text-gray-400 text-sm'>Még nincsenek aktivitások</p>
                <p className='text-gray-500 text-xs mt-1'>
                  Az első aktivitások hamarosan megjelennek
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
