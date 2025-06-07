'use client';

import { truncateContent } from '@/lib/post-utils';
import Link from 'next/link';

interface PostContentProps {
  title: string;
  content?: string;
  excerpt?: string;
  postId: string;
  maxLength?: number;
  className?: string;
}

/**
 * Magyar: Poszt tartalom komponens
 * Post content component - displays title, truncated content, and read more link
 */
export default function PostContent({
  title,
  content,
  excerpt,
  postId,
  maxLength = 120,
  className,
}: PostContentProps) {
  const displayContent = content || excerpt || '';
  const isContentLong = displayContent.length > maxLength;

  return (
    <div className={`mb-4 ${className || ''}`}>
      <Link href={`/posts/${postId}`} className='block group'>
        <h3 className='text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-200 mb-3 leading-tight'>
          {title}
        </h3>
      </Link>

      <div className='text-gray-300 text-sm leading-relaxed'>
        <span className='line-clamp-1'>{truncateContent(displayContent, maxLength)}</span>
        {isContentLong && (
          <Link
            href={`/posts/${postId}`}
            className='text-amber-400 hover:text-amber-300 ml-1 font-semibold transition-colors duration-200'
          >
            ...tovább
          </Link>
        )}
      </div>
    </div>
  );
}
