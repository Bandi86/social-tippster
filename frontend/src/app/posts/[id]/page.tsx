'use client';

import AuthGuard from '@/components/auth/auth-guard';
import BaseLayout from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import { PostsService } from '@/features/posts/posts-service';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [postId, setPostId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Resolve params promise in useEffect
  useEffect(() => {
    params.then(resolvedParams => {
      setPostId(resolvedParams.id);
    });
  }, [params]);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => PostsService.getPostById(postId!),
    enabled: !!postId,
  });

  const deletePostMutation = useMutation({
    mutationFn: () => PostsService.deletePost(postId!),
    onSuccess: () => {
      router.push('/posts');
    },
  });

  const handleDeleteClick = () => {
    if (deleteConfirm) {
      deletePostMutation.mutate();
    } else {
      setDeleteConfirm(true);
    }
  };

  const isAuthor = user?.id === post?.author.id;

  if (!postId || isLoading) {
    return (
      <AuthGuard>
        <BaseLayout>
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
          </div>
        </BaseLayout>
      </AuthGuard>
    );
  }

  if (error || !post) {
    return (
      <AuthGuard>
        <BaseLayout>
          <div className='bg-red-50 text-red-500 p-6 rounded-lg'>
            <h2 className='text-xl font-semibold'>Error</h2>
            <p className='mt-2'>
              This post could not be found or you don't have permission to view it.
            </p>
            <Link href='/posts'>
              <Button variant='outline' className='mt-4'>
                Go Back to Posts
              </Button>
            </Link>
          </div>
        </BaseLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <BaseLayout>
        <article className='max-w-4xl mx-auto'>
          <header className='mb-8'>
            <h1 className='text-3xl font-bold'>{post.title}</h1>
            <div className='flex items-center text-gray-500 text-sm mt-3'>
              <span>By {post.author.name}</span>
              <span className='mx-2'>•</span>
              <span>{formatDate(post.createdAt)}</span>
              {post.updatedAt !== post.createdAt && (
                <>
                  <span className='mx-2'>•</span>
                  <span>Updated on {formatDate(post.updatedAt)}</span>
                </>
              )}
            </div>
          </header>

          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <div className='prose max-w-none'>
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className='mb-4'>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className='mt-8 flex gap-4'>
            <Link href='/posts'>
              <Button variant='outline'>Back to Posts</Button>
            </Link>

            {isAuthor && (
              <>
                <Link href={`/posts/${postId}/edit`}>
                  <Button variant='outline'>Edit Post</Button>
                </Link>
                <Button
                  variant='outline'
                  className={
                    deleteConfirm
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700'
                      : ''
                  }
                  onClick={handleDeleteClick}
                  disabled={deletePostMutation.isPending}
                >
                  {deletePostMutation.isPending
                    ? 'Deleting...'
                    : deleteConfirm
                      ? 'Confirm Delete'
                      : 'Delete Post'}
                </Button>
                {deleteConfirm && (
                  <Button variant='ghost' onClick={() => setDeleteConfirm(false)}>
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </article>
      </BaseLayout>
    </AuthGuard>
  );
}
