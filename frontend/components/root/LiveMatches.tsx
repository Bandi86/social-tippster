'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

/**
 * Élő meccsek komponens
 * Valós idejű sportesemények eredményeinek megjelenítése
 */
export default function LiveMatches() {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Activity className='h-5 w-5 text-red-500' />
          Élő meccsek
          <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1'></div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-3'>
          <div className='p-3 bg-gray-800/50 rounded-lg border border-gray-700'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-semibold text-white'>
                Manchester United vs Liverpool
              </span>
              <Badge className='bg-red-600 text-white'>LIVE</Badge>
            </div>
            <div className='text-center'>
              <span className='text-2xl font-bold text-amber-400'>2 - 1</span>
            </div>
            <div className='text-xs text-gray-400 text-center mt-2'>67' - Premier League</div>
          </div>

          <div className='p-3 bg-gray-800/50 rounded-lg border border-gray-700'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-semibold text-white'>Lakers vs Warriors</span>
              <Badge className='bg-red-600 text-white'>LIVE</Badge>
            </div>
            <div className='text-center'>
              <span className='text-2xl font-bold text-amber-400'>89 - 92</span>
            </div>
            <div className='text-xs text-gray-400 text-center mt-2'>Q3 8:45 - NBA</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
