'use client';

import { Badge } from '@/components/ui/badge';
import { getPostTypeIcon, getPostTypeLabel, getPostTypeVariant } from '@/lib/post-utils';

interface PostTypeBadgeProps {
  type: string;
  className?: string;
}

/**
 * Magyar: Post típus badge komponens
 * Post type badge component - displays the type of post with appropriate styling
 */
export default function PostTypeBadge({ type, className }: PostTypeBadgeProps) {
  const Icon = getPostTypeIcon(type);
  const variant = getPostTypeVariant(type);
  const label = getPostTypeLabel(type);

  return (
    <Badge variant='outline' className={`${variant} ${className || ''}`}>
      <Icon className='h-4 w-4' />
      <span className='ml-1'>{label}</span>
    </Badge>
  );
}
