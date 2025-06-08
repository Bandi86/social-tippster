'use client';

import { PostCard } from '@/components/features/posts';
import { Post } from '@/store/posts';

interface PostListProps {
  posts?: Post[];
  initialPosts?: Post[];
  loading?: boolean;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: (postId: string) => void;
  showFilters?: boolean;
  showCreateButton?: boolean;
  authorFilter?: string;
}

export default function PostList({
  posts,
  initialPosts,
  loading = false,
  onPostUpdate,
  onPostDelete, // eslint-disable-line @typescript-eslint/no-unused-vars
  showFilters, // eslint-disable-line @typescript-eslint/no-unused-vars
  showCreateButton, // eslint-disable-line @typescript-eslint/no-unused-vars
  authorFilter, // eslint-disable-line @typescript-eslint/no-unused-vars
}: PostListProps) {
  const postsToShow = posts || initialPosts || [];
  if (loading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse bg-gray-800 rounded-lg h-32' />
        ))}
      </div>
    );
  }

  if (postsToShow.length === 0) {
    return (
      <div className='text-center py-8 text-gray-400'>
        <p>Még nincsenek posztok</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {postsToShow.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onPostUpdate={
            onPostUpdate ? updatedData => onPostUpdate({ ...post, ...updatedData }) : undefined
          }
        />
      ))}
    </div>
  );
}
