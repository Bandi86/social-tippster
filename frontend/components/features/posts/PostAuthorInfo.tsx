'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/date-utils';
import { getReputationBadgeColor } from '@/lib/post-utils';
import { Crown, Eye } from 'lucide-react';
import Link from 'next/link';

interface PostAuthorInfoProps {
  author?: {
    username?: string;
    profile_image?: string;
    reputation_score?: number;
  };
  createdAt: string;
  viewsCount: number;
  className?: string;
}

/**
 * Magyar: Post szerző információk komponens
 * Post author info component - displays author avatar, name, reputation, and post metadata
 */
export default function PostAuthorInfo({
  author,
  createdAt,
  viewsCount,
  className,
}: PostAuthorInfoProps) {
  const reputationColor = author?.reputation_score
    ? getReputationBadgeColor(author.reputation_score)
    : 'text-gray-400';

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <Avatar className='h-10 w-10'>
        <AvatarImage src={author?.profile_image} alt={author?.username || 'Felhasználó'} />
        <AvatarFallback className='bg-amber-600 text-white'>
          {author?.username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div>
        <div className='flex items-center gap-2'>
          <Link
            href={`/profile/${author?.username}`}
            className='font-medium text-white hover:text-amber-400 transition-colors'
          >
            {author?.username || 'Ismeretlen felhasználó'}
          </Link>
          {author?.reputation_score && author.reputation_score > 100 && (
            <Crown className={`h-4 w-4 ${reputationColor}`} />
          )}
        </div>

        <div className='flex items-center gap-2 text-sm text-gray-400'>
          <span>{formatRelativeTime(createdAt)}</span>
          <span>•</span>
          <div className='flex items-center gap-1'>
            <Eye className='h-3 w-3' />
            <span>{viewsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
