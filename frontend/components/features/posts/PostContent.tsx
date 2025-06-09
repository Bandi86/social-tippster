'use client';

import { truncateContent } from '@/lib/post-utils';
import Image from 'next/image';
import Link from 'next/link';

interface PostContentProps {
  title: string;
  content?: string;
  excerpt?: string;
  postId: string;
  maxLength?: number;
  className?: string;
  imageUrl?: string;
  isDetailView?: boolean;
}

/**
 * Magyar: Poszt tartalom komponens
 * Post content component - displays title, image (if exists), truncated content, and read more link
 */
export default function PostContent({
  title,
  content,
  excerpt,
  postId,
  maxLength = 120,
  className,
  imageUrl,
  isDetailView = false,
}: PostContentProps) {
  const displayContent = content || excerpt || '';
  const isContentLong = displayContent.length > maxLength;

  // Magyar: Cím eltávolítása a tartalom elejéről, ha már szerepel
  // English: Remove title from the beginning of content if it's already there
  let processedDisplayContent = displayContent;
  if (title && displayContent.startsWith(title)) {
    processedDisplayContent = displayContent.substring(title.length).trimStart();
  }

  return (
    <div className={`mb-4 ${className || ''}`}>
      {!isDetailView && (
        <Link href={`/posts/${postId}`} className='block group'>
          <h3 className='text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-200 mb-3 leading-tight'>
            {title}
          </h3>
        </Link>
      )}

      {isDetailView && (
        <h1 className='text-2xl font-bold text-white mb-4 leading-tight'>{title}</h1>
      )}

      {/* Image display */}
      {imageUrl && (
        <div className='mb-3 rounded-lg overflow-hidden border border-gray-700/50'>
          {!isDetailView ? (
            <Link href={`/posts/${postId}`} className='block group'>
              <Image
                src={imageUrl}
                alt={title}
                width={600}
                height={300}
                className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                priority={false}
              />
            </Link>
          ) : (
            <Image
              src={imageUrl}
              alt={title}
              width={800}
              height={400}
              className='w-full h-64 object-cover'
              priority={true}
            />
          )}
        </div>
      )}

      {/* Content display */}
      {processedDisplayContent && (
        <div className='text-gray-300 text-sm leading-relaxed'>
          <span className={isDetailView ? '' : 'line-clamp-3'}>
            {isDetailView
              ? processedDisplayContent
              : truncateContent(processedDisplayContent, maxLength)}
          </span>
          {!isDetailView && isContentLong && (
            <Link
              href={`/posts/${postId}`}
              className='text-amber-400 hover:text-amber-300 ml-1 font-semibold transition-colors duration-200'
            >
              ...tovább
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
