'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

/**
 * Legutóbbi aktivitások megjelenítése
 * A közösség legfrissebb tevékenységeit mutatja be
 */
export default function RecentActivity() {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Bell className='h-5 w-5 text-blue-500' />
          Legutóbbi aktivitás
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-3 text-sm'>
          <div className='flex items-start gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-blue-600 text-white text-xs'>J</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='text-gray-300'>
                <span className='text-white font-medium'>János</span> kommentelt a
                <span className='text-amber-400'> "Chelsea vs Arsenal"</span> posztra
              </div>
              <div className='text-xs text-gray-500 mt-1'>5 perc</div>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-green-600 text-white text-xs'>P</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='text-gray-300'>
                <span className='text-white font-medium'>Péter</span> új tippet oszott meg
              </div>
              <div className='text-xs text-gray-500 mt-1'>12 perc</div>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-purple-600 text-white text-xs'>A</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='text-gray-300'>
                <span className='text-white font-medium'>Anna</span> lájkolta a
                <span className='text-amber-400'> "NBA előrejelzések"</span> posztot
              </div>
              <div className='text-xs text-gray-500 mt-1'>18 perc</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
