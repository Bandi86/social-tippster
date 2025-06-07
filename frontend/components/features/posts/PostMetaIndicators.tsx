'use client';

import { hasImage } from '@/lib/post-utils';
import { Image } from 'lucide-react';

interface PostMetaIndicatorsProps {
  post: {
    image_url?: string;
  };
  className?: string;
}

/**
 * Magyar: Poszt meta indikátorok komponens
 * Post meta indicators component - displays image indicator and other meta info
 */
export default function PostMetaIndicators({ post, className }: PostMetaIndicatorsProps) {
  const showImageIndicator = hasImage(post);

  if (!showImageIndicator) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <span>•</span>
      <div className='flex items-center gap-1 text-blue-400'>
        <Image className='h-3 w-3' />
        <span className='text-xs'>Kép</span>
      </div>
    </div>
  );
}
