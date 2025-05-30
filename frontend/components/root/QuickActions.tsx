'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, Calendar, MessageSquare, Plus, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  isAuthenticated: boolean;
  onCreatePost: () => void;
}

/**
 * Gyors műveletek komponens
 * Bejelentkezett felhasználók számára gyors hozzáférést biztosít a fő funkciókhoz
 */
export default function QuickActions({ isAuthenticated, onCreatePost }: QuickActionsProps) {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Zap className='h-5 w-5' />
          Gyors műveletek
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {isAuthenticated ? (
          <>
            <Button onClick={onCreatePost} className='w-full bg-amber-600 hover:bg-amber-700'>
              <Plus className='h-4 w-4 mr-2' />
              Új poszt
            </Button>
            <Button
              variant='outline'
              className='w-full border-amber-600 text-amber-400 hover:bg-amber-900/20'
            >
              <Calendar className='h-4 w-4 mr-2' />
              Események
            </Button>
          </>
        ) : (
          <div className='text-center text-gray-400 text-sm p-4 space-y-4'>
            <div className='space-y-2'>
              <p className='text-gray-300 font-medium'>Bejelentkezés után:</p>
              <div className='space-y-1 text-xs text-gray-400'>
                <p className='flex items-center gap-2'>
                  <Plus className='h-3 w-3' />
                  Új posztok létrehozása
                </p>
                <p className='flex items-center gap-2'>
                  <MessageSquare className='h-3 w-3' />
                  Kommentelés és válaszadás
                </p>
                <p className='flex items-center gap-2'>
                  <TrendingUp className='h-3 w-3' />
                  Szavazás és értékelés
                </p>
                <p className='flex items-center gap-2'>
                  <Bookmark className='h-3 w-3' />
                  Posztok mentése
                </p>
              </div>
            </div>
            <div className='space-y-2'>
              <Link href='/auth/login'>
                <Button className='w-full bg-amber-600 hover:bg-amber-700 mb-2'>
                  Bejelentkezés
                </Button>
              </Link>
              <Link href='/auth/register'>
                <Button variant='outline' className='w-full border-amber-600 text-amber-400'>
                  Új fiók létrehozása
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
