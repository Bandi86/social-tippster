// Profil skeleton komponens - betöltési állapot megjelenítése
// Profile skeleton component - loading state display
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Profil skeleton komponens - egységes betöltési állapot a profil oldalakhoz
 * Újrafelhasználható minden profil betöltéskor
 */
export default function ProfileSkeleton() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Vissza gomb skeleton - Back button skeleton */}
          <Skeleton className='h-10 w-24 bg-gray-700' />

          {/* Profil kártya skeleton - Profile card skeleton */}
          <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
            <CardHeader>
              <div className='flex gap-6'>
                {/* Avatar skeleton */}
                <Skeleton className='h-32 w-32 rounded-full bg-gray-700' />
                <div className='space-y-4 flex-1'>
                  {/* Név és adatok - Name and details */}
                  <Skeleton className='h-8 w-64 bg-gray-700' />
                  <Skeleton className='h-4 w-32 bg-gray-700' />
                  <Skeleton className='h-16 w-full bg-gray-700' />
                  <div className='flex gap-2'>
                    <Skeleton className='h-9 w-24 bg-gray-700' />
                    <Skeleton className='h-9 w-24 bg-gray-700' />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Statisztikák skeleton - Statistics skeleton */}
              <div className='grid grid-cols-6 gap-4'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='text-center space-y-2'>
                    <Skeleton className='h-8 w-full bg-gray-700' />
                    <Skeleton className='h-4 w-full bg-gray-700' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabok skeleton - Tabs skeleton */}
          <div className='space-y-4'>
            <Skeleton className='h-10 w-64 bg-gray-700' />
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className='h-32 w-full bg-gray-700' />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
