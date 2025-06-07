'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';

interface FavoriteButtonProps {
  postId: string;
  isFavorited?: boolean;
  favoritesCount?: number;
  onToggle?: (favorited: boolean) => void;
  className?: string;
}

/**
 * FavoriteButton component - uses bookmark functionality internally
 * but provides a "favorite" user experience with heart icon
 */
export default function FavoriteButton({
  postId,
  isFavorited = false,
  favoritesCount = 0,
  onToggle,
  className = '',
}: FavoriteButtonProps) {
  const [isToggling, setIsToggling] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toggleBookmark } = usePosts();

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A kedvencekhez adáshoz be kell jelentkezni',
        variant: 'destructive',
      });
      return;
    }

    if (isToggling) return;
    setIsToggling(true);

    try {
      const result = await toggleBookmark(postId);

      toast({
        title: 'Sikeres',
        description: result.bookmarked ? 'Hozzáadva a kedvencekhez' : 'Eltávolítva a kedvencekből',
      });

      onToggle?.(result.bookmarked);
    } catch (error) {
      console.error('Favorite toggle error:', error);
      toast({
        title: 'Hiba',
        description: 'A kedvenc művelet sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
    }
  };

  // For non-authenticated users, show as read-only
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-1 text-gray-500 px-2 py-1 ${className}`}>
        <Heart className='h-4 w-4' />
        <span className='ml-1 text-sm'>{favoritesCount}</span>
      </div>
    );
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleToggleFavorite}
      disabled={isToggling}
      className={`h-8 px-2 transition-all duration-200 ${
        isFavorited
          ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
          : 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
      } ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-200 ${
          isFavorited ? 'fill-current scale-110' : ''
        }`}
      />
      <span className='ml-1 text-sm'>{favoritesCount}</span>
    </Button>
  );
}
