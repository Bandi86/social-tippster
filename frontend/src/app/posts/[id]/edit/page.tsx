'use client';

import AuthGuard from '@/components/auth/auth-guard';
import BaseLayout from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostsService } from '@/features/posts/posts-service';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema for post editing
const postSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  content: z.string().min(20, { message: 'Content must be at least 20 characters' }),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [postId, setPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Resolve params promise in useEffect
  useEffect(() => {
    params.then(resolvedParams => {
      setPostId(resolvedParams.id);
    });
  }, [params]);
  const { user } = useAuth();

  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => PostsService.getPostById(postId!),
    enabled: !!postId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Update form with post data when it loads
  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
      });
    }
  }, [post, reset]);

  const updatePostMutation = useMutation({
    mutationFn: (data: PostFormValues) => PostsService.updatePost(postId!, data),
    onSuccess: () => {
      router.push(`/posts/${postId}`);
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to update post. Please try again.');
    },
  });

  const onSubmit = (data: PostFormValues) => {
    setError(null);
    updatePostMutation.mutate(data);
  };

  // Check if user is the author
  const isAuthor = post && user?.id === post.author.id;

  if (!postId || isLoadingPost) {
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

  if (postError || !post) {
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

  if (!isAuthor) {
    return (
      <AuthGuard>
        <BaseLayout>
          <div className='bg-red-50 text-red-500 p-6 rounded-lg'>
            <h2 className='text-xl font-semibold'>Permission Denied</h2>
            <p className='mt-2'>
              You don't have permission to edit this post. Only the author can edit it.
            </p>
            <Link href={`/posts/${postId}`}>
              <Button variant='outline' className='mt-4'>
                Go Back to Post
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
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl font-bold mb-6'>Edit Post</h1>

          {error && <div className='bg-red-50 text-red-500 p-4 rounded-md mb-6'>{error}</div>}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='bg-white p-6 rounded-lg shadow-sm space-y-6'
          >
            <div className='space-y-2'>
              <label htmlFor='title' className='text-sm font-medium'>
                Title
              </label>
              <Input
                id='title'
                placeholder='Enter a catchy title for your post'
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className='text-sm text-red-500'>{errors.title.message}</p>}
            </div>

            <div className='space-y-2'>
              <label htmlFor='content' className='text-sm font-medium'>
                Content
              </label>
              <textarea
                id='content'
                rows={12}
                placeholder='Share your tips, insights, and knowledge...'
                {...register('content')}
                className={`w-full rounded-md border ${
                  errors.content ? 'border-red-500' : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors.content && <p className='text-sm text-red-500'>{errors.content.message}</p>}
            </div>

            <div className='flex items-center gap-4'>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push(`/posts/${postId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </BaseLayout>
    </AuthGuard>
  );
}
