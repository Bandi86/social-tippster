// Profil tartalom komponens - tab tartalomhoz újrafelhasználható container
// Profile content component - reusable container for tab content
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

interface ProfileContentProps {
  title?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
}

/**
 * Profil tartalom komponens - újrafelhasználható container tab tartalmakhoz
 * Kezel betöltési, üres és tartalom állapotokat
 *
 * @param title - Kártya címe
 * @param isLoading - Betöltési állapot
 * @param isEmpty - Üres állapot
 * @param emptyIcon - Üres állapot ikonja
 * @param emptyTitle - Üres állapot címe
 * @param emptyDescription - Üres állapot leírása
 * @param emptyAction - Üres állapot művelet gombja
 * @param children - Tartalom
 */
export default function ProfileContent({
  title,
  isLoading = false,
  isEmpty = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: ProfileContentProps) {
  // Betöltési állapot megjelenítése - Loading state display
  if (isLoading) {
    return (
      <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
        {title && (
          <CardHeader>
            <CardTitle className='text-white'>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-32 w-full bg-gray-700' />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Üres állapot megjelenítése - Empty state display
  if (isEmpty) {
    return (
      <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
        {title && (
          <CardHeader>
            <CardTitle className='text-white'>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className='pt-6'>
          <div className='text-center py-8 text-gray-400'>
            {emptyIcon && <div className='mb-4 flex justify-center'>{emptyIcon}</div>}
            {emptyTitle && <h3 className='text-lg font-semibold mb-2 text-white'>{emptyTitle}</h3>}
            {emptyDescription && <p className='mb-4'>{emptyDescription}</p>}
            {emptyAction && (
              <Button
                asChild={!!emptyAction.href}
                onClick={emptyAction.onClick}
                className='bg-amber-600 hover:bg-amber-700 text-white'
              >
                {emptyAction.href ? (
                  <a href={emptyAction.href}>{emptyAction.label}</a>
                ) : (
                  emptyAction.label
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normál tartalom megjelenítése - Normal content display
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      {title && (
        <CardHeader>
          <CardTitle className='text-white'>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? 'pt-6' : ''}>{children}</CardContent>
    </Card>
  );
}
