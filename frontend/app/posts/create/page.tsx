'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { CreatePostData } from '@/store/posts';

const postSchema = z.object({
  title: z.string().min(1, 'A cím kötelező').max(255, 'A cím túl hosszú'),
  content: z.string().min(1, 'A tartalom kötelező'),
  type: z.enum(['general', 'discussion', 'news', 'analysis', 'help_request'], {
    required_error: 'A poszt típusa kötelező',
  }),
  is_premium: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { createPost } = usePosts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: 'general',
      is_premium: false,
      tags: [],
    },
  });

  const watchedType = watch('type');
  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: PostFormData) => {
    if (!isAuthenticated) {
      toast({
        title: 'Hiba',
        description: 'Jelentkezzen be a poszt létrehozásához',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: CreatePostData = {
        //title: data.title,
        content: data.content,
        type: data.type,
        isPremium: data.is_premium,
      };

      const newPost = await createPost(postData);

      toast({
        title: 'Sikeres',
        description: 'A poszt sikeresen létrehozva',
      });

      router.push(`/posts/${newPost.id}`);
    } catch (error: any) {
      console.error('Create post error:', error);
      toast({
        title: 'Hiba',
        description: error.message || 'A poszt létrehozása sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setValue('tags', tags);
  };

  const renderPreview = () => (
    <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-400'>Előnézet</span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                watchedType === 'general'
                  ? 'bg-gray-500/20 text-gray-400'
                  : watchedType === 'discussion'
                    ? 'bg-blue-500/20 text-blue-400'
                    : watchedType === 'news'
                      ? 'bg-purple-500/20 text-purple-400'
                      : watchedType === 'analysis'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-green-500/20 text-green-400'
              }`}
            >
              {watchedType}
            </span>
          </div>
        </div>
        <CardTitle className='text-white'>{watchedTitle || 'Poszt címe'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-gray-300 whitespace-pre-wrap'>
          {watchedContent || 'Poszt tartalma...'}
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='text-gray-400 hover:text-white'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Vissza
            </Button>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent'>
                Új poszt létrehozása
              </h1>
              <p className='text-gray-400'>Ossza meg gondolatait és tartalmat a közösséggel</p>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => setPreview(!preview)}
              className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
            >
              <Eye className='h-4 w-4 mr-2' />
              {preview ? 'Szerkesztés' : 'Előnézet'}
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Form */}
          <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
            <CardHeader>
              <CardTitle className='text-white'>Poszt részletei</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Title */}
                <div className='space-y-2'>
                  <Label htmlFor='title' className='text-gray-300'>
                    Cím *
                  </Label>
                  <Input
                    id='title'
                    {...register('title')}
                    placeholder='Adjon meg egy szemléletes címet...'
                    className='bg-gray-800 border-gray-600 text-white'
                  />
                  {errors.title && <p className='text-red-400 text-sm'>{errors.title.message}</p>}
                </div>

                {/* Type */}
                <div className='space-y-2'>
                  <Label htmlFor='type' className='text-gray-300'>
                    Típus *
                  </Label>
                  <Select
                    value={watchedType}
                    onValueChange={(value: any) => setValue('type', value)}
                  >
                    <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                      <SelectValue placeholder='Válasszon típust' />
                    </SelectTrigger>
                    <SelectContent className='bg-gray-800 border-gray-600'>
                      <SelectItem value='general'>📝 Általános</SelectItem>
                      <SelectItem value='discussion'>💬 Beszélgetés</SelectItem>
                      <SelectItem value='news'>📰 Hírek</SelectItem>
                      <SelectItem value='analysis'>📊 Elemzés</SelectItem>
                      <SelectItem value='help_request'>❓ Segítségkérés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div className='space-y-2'>
                  <Label htmlFor='content' className='text-gray-300'>
                    Tartalom *
                  </Label>
                  <Textarea
                    id='content'
                    {...register('content')}
                    placeholder='Írja le részletesen a gondolatait...'
                    rows={8}
                    className='bg-gray-800 border-gray-600 text-white resize-none'
                  />
                  {errors.content && (
                    <p className='text-red-400 text-sm'>{errors.content.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div className='space-y-2'>
                  <Label htmlFor='tags' className='text-gray-300'>
                    Címkék
                  </Label>
                  <Input
                    id='tags'
                    placeholder='Címkék vesszővel elválasztva (pl. futball, premier league, elemzés)'
                    onChange={e => handleTagsChange(e.target.value)}
                    className='bg-gray-800 border-gray-600 text-white'
                  />
                  <p className='text-gray-500 text-sm'>
                    Címkék segítenek másoknak megtalálni a posztját
                  </p>
                </div>

                {/* Premium content */}
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='is_premium'
                    {...register('is_premium')}
                    className='border-gray-600'
                  />
                  <Label htmlFor='is_premium' className='text-gray-300'>
                    Prémium tartalom (csak előfizetők számára)
                  </Label>
                </div>

                {/* Submit buttons */}
                <div className='flex gap-4 pt-4'>
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='bg-amber-600 hover:bg-amber-700 flex-1'
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Közzététel...
                      </>
                    ) : (
                      <>
                        <Save className='h-4 w-4 mr-2' />
                        Poszt közzététele
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className='space-y-6'>
            {preview && renderPreview()}

            {/* Helpful Guidelines */}
            <Card className='bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700'>
              <CardHeader>
                <CardTitle className='text-blue-400'>Hasznos tanácsok</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm text-gray-300'>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>Használjon szemléletes és informatív címet</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>Válassza ki a megfelelő típust a jobb kategorizálásért</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>Címkék segítenek a posztja megtalálásában</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>Részletes elemzés növeli a hitelességet</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
