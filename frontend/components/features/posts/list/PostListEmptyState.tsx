'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PostListEmptyStateProps {
  searchQuery?: string;
  isAuthenticated: boolean;
  showCreateButton: boolean;
}

/**
 * Magyar: PostList üres állapot komponens
 * Shows appropriate message when no posts are found
 */
export default function PostListEmptyState({
  searchQuery,
  isAuthenticated,
  showCreateButton,
}: PostListEmptyStateProps) {
  return (
    <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg'>
      <CardContent className='p-8 text-center'>
        <div className='text-gray-400 mb-4'>
          {searchQuery ? (
            <>
              <Search className='h-12 w-12 mx-auto mb-3' />
              <p>Nincs találat a keresésre: "{searchQuery}"</p>
            </>
          ) : (
            <>
              <Plus className='h-12 w-12 mx-auto mb-3' />
              <p>Még nincsenek posztok</p>
            </>
          )}
        </div>
        {isAuthenticated && showCreateButton && (
          <Link href='/posts/create'>
            <Button className='bg-amber-600 hover:bg-amber-700 rounded-lg shadow-md'>
              <Plus className='h-4 w-4 mr-2' />
              Első poszt létrehozása
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
