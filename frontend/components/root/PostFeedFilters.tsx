'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface PostFeedFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

/**
 * Poszt szűrő komponens
 * A felhasználók különböző kategóriák alapján szűrhetik a posztokat
 */
export default function PostFeedFilters({
  selectedCategory,
  onCategoryChange,
}: PostFeedFiltersProps) {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg text-white flex items-center gap-2'>
            <Flame className='h-5 w-5 text-amber-500' />
            Legfrissebb posztok
          </CardTitle>
          <div className='flex gap-2'>
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onCategoryChange('all')}
              className={
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }
            >
              Összes
            </Button>
            <Button
              variant={selectedCategory === 'tips' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onCategoryChange('tips')}
              className={
                selectedCategory === 'tips'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }
            >
              Tippek
            </Button>
            <Button
              variant={selectedCategory === 'discussion' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onCategoryChange('discussion')}
              className={
                selectedCategory === 'discussion'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }
            >
              Beszélgetés
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
