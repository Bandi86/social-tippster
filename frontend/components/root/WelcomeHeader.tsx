'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { Sparkles, TrendingUp } from 'lucide-react';

/**
 * Üdvözlő fejléc komponens Zustand store-ral
 * Személyre szabott üdvözlő üzenet bejelentkezett és vendég felhasználók számára
 */
export default function WelcomeHeader() {
  const { isAuthenticated, user } = useAuthStore();

  const getWelcomeMessage = () => {
    if (isAuthenticated && user) {
      const timeOfDay = new Date().getHours();
      let greeting = 'Üdvözlünk vissza';

      if (timeOfDay < 12) greeting = 'Jó reggelt';
      else if (timeOfDay < 18) greeting = 'Jó napot';
      else greeting = 'Jó estét';

      return `${greeting}, ${user.username}!`;
    }
    return 'Üdvözlünk a Social Tippster-ben!';
  };

  const getSubMessage = () => {
    if (isAuthenticated) {
      return 'Oszd meg és beszéld meg a legjobb tippeket a közösségünkkel';
    }
    return 'Fedezd fel az összes tippet, elemzést és beszélgetést - regisztráció nélkül is!';
  };

  const getIcon = () => {
    return isAuthenticated ? (
      <TrendingUp className='h-6 w-6 text-amber-200' />
    ) : (
      <Sparkles className='h-6 w-6 text-amber-200' />
    );
  };

  return (
    <Card className='bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500 shadow-lg'>
      <CardContent className='p-6 text-center'>
        <div className='flex items-center justify-center mb-3'>{getIcon()}</div>
        <h1 className='text-3xl font-bold text-white mb-2'>{getWelcomeMessage()}</h1>
        <p className='text-amber-100 text-lg'>{getSubMessage()}</p>
        {isAuthenticated && user && (
          <div className='mt-3 text-amber-200 text-sm'>
            <p>Szép napot kívánunk a tippeléshez! 🎯</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
