'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Vendég felhasználók számára megjelenítendő értesítő sáv
 * Bejelentkezési és regisztrációs linkekkel
 */
export default function GuestUserNotice() {
  return (
    <div className='bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-b border-amber-700/30'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2 text-amber-300'>
            <span>👋</span>
            <span>Üdvözöljük! Böngéssze az összes tartalmat regisztráció nélkül.</span>
          </div>
          <div className='flex items-center gap-2'>
            <Link href='/auth'>
              <Button
                size='sm'
                variant='ghost'
                className='text-amber-400 hover:text-amber-300 hover:bg-amber-900/50'
              >
                Bejelentkezés
              </Button>
            </Link>
            <Link href='/auth'>
              <Button size='sm' className='bg-amber-600 hover:bg-amber-700 text-white'>
                Regisztráció
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
