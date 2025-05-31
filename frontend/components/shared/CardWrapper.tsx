/**
 * Újrafelhasználható kártya komponens fejléccel és betöltési állapottal
 * Reusable card component with header and loading state
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface CardWrapperProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  badge?: string | number;
  liveIndicator?: boolean;
}

export default function CardWrapper({
  title,
  icon: Icon,
  iconColor = 'text-amber-500',
  children,
  isLoading = false,
  error = null,
  className = '',
  badge,
  liveIndicator = false,
}: CardWrapperProps) {
  if (error) {
    return (
      <Card className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 ${className}`}>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg text-white flex items-center gap-2'>
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <p className='text-red-400 text-sm'>{error}</p>
            <p className='text-gray-500 text-xs mt-2'>Próbáld meg később</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 ${className}`}>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
          {liveIndicator && (
            <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1'></div>
          )}
          {badge && (
            <span className='ml-auto text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded-full'>
              {badge}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {isLoading ? (
          <div className='space-y-3'>
            {Array(3)
              .fill(null)
              .map((_, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3 flex-1'>
                    <Skeleton className='h-8 w-8 rounded-full bg-gray-700' />
                    <div className='flex-1'>
                      <Skeleton className='h-4 w-24 mb-1 bg-gray-700' />
                      <Skeleton className='h-3 w-16 bg-gray-700' />
                    </div>
                  </div>
                  <Skeleton className='h-6 w-12 bg-gray-700' />
                </div>
              ))}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
