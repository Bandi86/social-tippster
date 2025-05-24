'use client';

import AuthGuard from '@/components/auth/auth-guard';
import BaseLayout from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostsService } from '@/features/posts/posts-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema for post creation
const postSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  content: z.string().min(20, { message: 'Content must be at least 20 characters' }),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const createPostMutation = useMutation({
    mutationFn: PostsService.createPost,
    onSuccess: data => {
      router.push(`/posts/${data.id}`);
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to create post. Please try again.');
    },
  });

  const onSubmit = (data: PostFormValues) => {
    setError(null);
    createPostMutation.mutate(data);
  };

  return (
    <AuthGuard>
      <BaseLayout>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl font-bold mb-6'>Create New Post</h1>

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
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </Button>
              <Button type='button' variant='outline' onClick={() => router.push('/posts')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </BaseLayout>
    </AuthGuard>
  );
}
