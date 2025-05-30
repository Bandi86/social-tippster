'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Bookmark,
  Home as HomeIcon,
  MessageSquare,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';

interface MainNavigationProps {
  isAuthenticated: boolean;
}

/**
 * Fő navigációs komponens az oldalsávban
 * Az összes fő oldal elérését biztosítja
 */
export default function MainNavigation({ isAuthenticated }: MainNavigationProps) {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <HomeIcon className='h-5 w-5' />
          Navigáció
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <Link href='/'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
          >
            <HomeIcon className='h-4 w-4 mr-3' />
            Főoldal
          </Button>
        </Link>
        <Link href='/posts'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
          >
            <TrendingUp className='h-4 w-4 mr-3' />
            Tippek
          </Button>
        </Link>
        <Link href='/discussions'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
          >
            <MessageSquare className='h-4 w-4 mr-3' />
            Beszélgetések
          </Button>
        </Link>
        <Link href='/news'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
          >
            <BookOpen className='h-4 w-4 mr-3' />
            Hírek
          </Button>
        </Link>
        <Link href='/analysis'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
          >
            <Star className='h-4 w-4 mr-3' />
            Elemzések
          </Button>
        </Link>
        {isAuthenticated && (
          <>
            <Link href='/bookmarks'>
              <Button
                variant='ghost'
                className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
              >
                <Bookmark className='h-4 w-4 mr-3' />
                Mentett posztok
              </Button>
            </Link>
            <Link href='/profile'>
              <Button
                variant='ghost'
                className='w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700'
              >
                <User className='h-4 w-4 mr-3' />
                Profilom
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
