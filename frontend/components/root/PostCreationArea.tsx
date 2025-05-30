'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface User {
  username?: string;
  profile_image?: string;
}

interface PostCreationAreaProps {
  isAuthenticated: boolean;
  user?: User;
  onCreatePost: () => void;
}

/**
 * Poszt létrehozási terület komponens
 * Bejelentkezett felhasználók számára poszt létrehozási felület
 * Vendég felhasználók számára regisztrációra ösztönző üzenet
 */
export default function PostCreationArea({
  isAuthenticated,
  user,
  onCreatePost,
}: PostCreationAreaProps) {
  if (isAuthenticated) {
    return (
      <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
        <CardContent className='p-4'>
          <div className='flex items-center gap-4 mb-4'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={user?.profile_image} />
              <AvatarFallback className='bg-amber-600 text-white'>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={onCreatePost}
              variant='outline'
              className='flex-1 justify-start text-gray-400 border-gray-600 hover:border-amber-600 hover:bg-gray-800'
            >
              Mit gondolsz erről a meccsről?
            </Button>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={onCreatePost}
              variant='ghost'
              size='sm'
              className='text-gray-400 hover:text-amber-400 hover:bg-gray-800'
            >
              <MessageSquare className='h-4 w-4 mr-2' />
              Poszt
            </Button>
            <Button
              onClick={onCreatePost}
              variant='ghost'
              size='sm'
              className='text-gray-400 hover:text-amber-400 hover:bg-gray-800'
            >
              <TrendingUp className='h-4 w-4 mr-2' />
              Tipp
            </Button>
            <Button
              onClick={onCreatePost}
              variant='ghost'
              size='sm'
              className='text-gray-400 hover:text-amber-400 hover:bg-gray-800'
            >
              <BookOpen className='h-4 w-4 mr-2' />
              Elemzés
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardContent className='p-6 text-center'>
        <h3 className='text-xl font-semibold text-white mb-2'>Fedezd fel a legjobb tippeket!</h3>
        <p className='text-gray-400 mb-4'>
          Böngészd az összes posztot és elemzést. Jelentkezz be, hogy te is posztolhass, kommentelj
          és szavazz!
        </p>
        <div className='flex gap-3 justify-center'>
          <Link href='/auth/login'>
            <Button className='bg-amber-600 hover:bg-amber-700'>Bejelentkezés</Button>
          </Link>
          <Link href='/auth/register'>
            <Button
              variant='outline'
              className='border-amber-600 text-amber-400 hover:bg-amber-900/20'
            >
              Regisztráció
            </Button>
          </Link>
        </div>
        <div className='mt-4 text-xs text-gray-500'>
          <p>✨ Minden tartalom megtekinthető regisztráció nélkül</p>
        </div>
      </CardContent>
    </Card>
  );
}
