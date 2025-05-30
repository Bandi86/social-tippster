'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

/**
 * Napi statisztikák megjelenítése
 * Az aktuális napi aktivitásokat és számokat mutatja be
 */
export default function QuickStats() {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Zap className='h-5 w-5 text-purple-500' />
          Mai statisztikák
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-3 text-center'>
          <div className='p-3 bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-lg'>
            <div className='text-2xl font-bold text-amber-400'>89</div>
            <div className='text-xs text-gray-400'>Új posztok</div>
          </div>
          <div className='p-3 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg'>
            <div className='text-2xl font-bold text-green-400'>156</div>
            <div className='text-xs text-gray-400'>Aktív tippek</div>
          </div>
          <div className='p-3 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg'>
            <div className='text-2xl font-bold text-blue-400'>1.2K</div>
            <div className='text-xs text-gray-400'>Online</div>
          </div>
          <div className='p-3 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg'>
            <div className='text-2xl font-bold text-purple-400'>87%</div>
            <div className='text-xs text-gray-400'>Pontosság</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
