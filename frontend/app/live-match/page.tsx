'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Radio, TrendingUp, Users } from 'lucide-react';

export default function LiveMatchPage() {
  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-white mb-2'>Élő Meccs</h1>
        <p className='text-gray-400'>Követd figyelemmel a folyamatban lévő mérkőzéseket</p>
      </div>

      <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-xl text-white flex items-center gap-2'>
              <Radio className='h-5 w-5 text-red-500' />
              Élő Közvetítés
            </CardTitle>
            <Badge variant='outline' className='text-red-400 border-red-400 animate-pulse'>
              LIVE
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='text-center py-8'>
            <div className='text-gray-400 mb-4'>
              <Radio className='h-12 w-12 mx-auto mb-3 text-red-500' />
              <p>Jelenleg nincs élő meccs</p>
            </div>
            <p className='text-sm text-gray-500'>
              Az élő meccsek itt jelennek meg, amikor elérhetőek
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center p-4 bg-gray-800/50 rounded-lg'>
              <Users className='h-6 w-6 mx-auto mb-2 text-blue-400' />
              <div className='text-lg font-bold text-white'>0</div>
              <div className='text-sm text-gray-400'>Néző</div>
            </div>

            <div className='text-center p-4 bg-gray-800/50 rounded-lg'>
              <TrendingUp className='h-6 w-6 mx-auto mb-2 text-green-400' />
              <div className='text-lg font-bold text-white'>0</div>
              <div className='text-sm text-gray-400'>Tipp</div>
            </div>

            <div className='text-center p-4 bg-gray-800/50 rounded-lg'>
              <Clock className='h-6 w-6 mx-auto mb-2 text-yellow-400' />
              <div className='text-lg font-bold text-white'>-</div>
              <div className='text-sm text-gray-400'>Idő</div>
            </div>

            <div className='text-center p-4 bg-gray-800/50 rounded-lg'>
              <Radio className='h-6 w-6 mx-auto mb-2 text-red-400' />
              <div className='text-lg font-bold text-white'>0</div>
              <div className='text-sm text-gray-400'>Komment</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
