'use client';

import { ArrowLeft, FileX } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PostNotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950/20 flex items-center justify-center'>
      <Card className='w-full max-w-md mx-4 bg-gray-900/50 border-gray-700/50'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center'>
            <FileX className='h-8 w-8 text-gray-400' />
          </div>
          <CardTitle className='text-xl text-gray-200'>Poszt nem található</CardTitle>
        </CardHeader>
        <CardContent className='text-center space-y-4'>
          <p className='text-gray-400'>A keresett poszt nem létezik vagy el lett távolítva.</p>
          <div className='flex flex-col sm:flex-row gap-2 justify-center'>
            <Button asChild variant='outline'>
              <Link href='/posts' className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Vissza a posztokhoz
              </Link>
            </Button>
            <Button asChild>
              <Link href='/'>Főoldal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
