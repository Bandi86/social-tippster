'use client';

import { hasTipDetails } from '@/lib/post-utils';

interface TipDetailsDisplayProps {
  post: {
    type: string;
    odds?: number;
    stake?: number;
    confidence?: number;
  };
  className?: string;
}

/**
 * Magyar: Tipp részletek megjelenítő komponens
 * Tip details display component - shows betting odds, stake, and confidence for tip posts
 */
export default function TipDetailsDisplay({ post, className }: TipDetailsDisplayProps) {
  // Magyar: Ha nincs tipp részlet, ne jelenítsen meg semmit
  if (!hasTipDetails(post)) {
    return null;
  }

  return (
    <div
      className={`flex gap-4 text-sm text-gray-400 bg-gray-800/50 rounded-lg p-3 mt-3 ${className || ''}`}
    >
      {post.odds && (
        <div className='flex items-center gap-1'>
          <span className='font-medium text-green-400'>Odds:</span>
          <span>{post.odds}</span>
        </div>
      )}
      {post.stake && (
        <div className='flex items-center gap-1'>
          <span className='font-medium text-blue-400'>Tét:</span>
          <span>{post.stake}/10</span>
        </div>
      )}
      {post.confidence && (
        <div className='flex items-center gap-1'>
          <span className='font-medium text-amber-400'>Bizalom:</span>
          <span>{post.confidence}/5</span>
        </div>
      )}
    </div>
  );
}
