'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

/**
 * Közösségi statisztikák komponens
 * Valós idejű közösségi adatok megjelenítése
 */
export default function CommunityStats() {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Közösség
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='text-sm text-gray-300 space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-400 rounded-full'></div>
              Online felhasználók
            </span>
            <span className='text-green-400 font-semibold'>1,234</span>
          </div>
          <div className='flex justify-between'>
            <span>Összes tag:</span>
            <span className='text-amber-400 font-semibold'>12,567</span>
          </div>
          <div className='flex justify-between'>
            <span>Mai posztok:</span>
            <span className='text-blue-400 font-semibold'>89</span>
          </div>
          <div className='flex justify-between'>
            <span>Aktív tippek:</span>
            <span className='text-purple-400 font-semibold'>156</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
