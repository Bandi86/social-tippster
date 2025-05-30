'use client';

import { Card, CardContent } from '@/components/ui/card';

interface User {
  username?: string;
}

interface WelcomeHeaderProps {
  isAuthenticated: boolean;
  user?: User;
}

/**
 * Üdvözlő fejléc komponens
 * Személyre szabott üdvözlő üzenet bejelentkezett és vendég felhasználók számára
 */
export default function WelcomeHeader({ isAuthenticated, user }: WelcomeHeaderProps) {
  return (
    <Card className='bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500'>
      <CardContent className='p-6 text-center'>
        <h1 className='text-3xl font-bold text-white mb-2'>
          {isAuthenticated
            ? `Üdvözlünk vissza, ${user?.username}!`
            : 'Üdvözlünk a Social Tippster-ben!'}
        </h1>
        <p className='text-amber-100'>
          {isAuthenticated
            ? 'Oszd meg és beszéld meg a legjobb tippeket a közösségünkkel'
            : 'Fedezd fel az összes tippet, elemzést és beszélgetést - regisztráció nélkül is!'}
        </p>
      </CardContent>
    </Card>
  );
}
