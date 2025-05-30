'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  username?: string;
  profile_image?: string;
  role?: string;
}

interface UserProfileQuickViewProps {
  user: User;
}

/**
 * Felhasználói profil gyors áttekintő komponens
 * Bejelentkezett felhasználók számára jeleníti meg az alapvető profil információkat
 */
export default function UserProfileQuickView({ user }: UserProfileQuickViewProps) {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={user.profile_image} />
            <AvatarFallback className='bg-amber-600 text-white'>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <h3 className='font-semibold text-white'>{user.username}</h3>
            <p className='text-sm text-gray-400'>
              {user.role === 'admin' ? 'Admin' : 'Felhasználó'}
            </p>
          </div>
        </div>
        <div className='mt-4 grid grid-cols-2 gap-2 text-xs'>
          <div className='text-center p-2 bg-gray-800 rounded'>
            <div className='text-amber-400 font-semibold'>12</div>
            <div className='text-gray-400'>Posztok</div>
          </div>
          <div className='text-center p-2 bg-gray-800 rounded'>
            <div className='text-green-400 font-semibold'>89%</div>
            <div className='text-gray-400'>Pontosság</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
