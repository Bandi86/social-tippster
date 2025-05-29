'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  type: z.enum(['tip', 'discussion', 'news', 'analysis'], {
    required_error: 'A poszt típusa kötelező',
  }),
  odds: z.number().min(1.01).max(1000).optional(),
  stake: z.number().min(1).max(10).optional(),
  confidence: z.number().min(1).max(5).optional(),
  betting_market: z.string().optional(),
  is_premium: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { currentPost: post, isLoading: loading, fetchPostById, updatePost } = usePosts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const postId = params.id as string;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: 'discussion',
      is_premium: false,
      tags: [],
    },
  });

  const watchedType = watch('type');
  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  // Load post data on mount
  useEffect(() => {
    if (postId && isAuthenticated) {
      loadPost();
    } else if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [postId, isAuthenticated, router]);

  const loadPost = async () => {
    try {
      await fetchPostById(postId);

      // The post is now in the store as currentPost
      if (!post) return;

      // Check if user owns this post
      if (!user || post.author_id !== user.user_id) {
        toast({
          title: 'Hozzáférés megtagadva',
          description: 'Csak a saját posztjait szerkesztheti',
          variant: 'destructive',
        });
        router.push(`/posts/${postId}`);
        return;
      }

      // Pre-populate form with existing data
      reset({
        title: post.title,
        content: post.content,
        type: post.type as any,
        odds: post.odds || undefined,
        stake: post.stake || undefined,
        confidence: post.confidence || undefined,
        betting_market: post.betting_market || '',
        is_premium: post.is_premium || false,
        tags: [], // tags property doesn't exist in our Post interface
      });
    } catch (error) {
      console.error('Failed to load post:', error);
      toast({
        title: 'Hiba',
        description: 'A poszt betöltése sikertelen',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  };

  const onSubmit = async (data: PostFormData) => {
    if (!isAuthenticated || !post) {
      toast({
        title: 'Hiba',
        description: 'Jelentkezzen be a poszt szerkesztéséhez',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: Partial<CreatePostData> = {
        title: data.title,
        content: data.content,
        type: data.type,
        is_premium: data.is_premium,
      };

      // Add tip-specific fields if type is tip
      if (data.type === 'tip') {
        if (data.odds) updateData.odds = data.odds;
        if (data.stake) updateData.stake = data.stake;
        if (data.confidence) updateData.confidence = data.confidence;
        if (data.betting_market) updateData.betting_market = data.betting_market;
      }

      await updatePost(postId, updateData);

      toast({
        title: 'Sikeres',
        description: 'A poszt sikeresen frissítve',
      });

      router.push(`/posts/${postId}`);
    } catch (error: any) {
      console.error('Update post error:', error);
      toast({
        title: 'Hiba',
        description: error.message || 'A poszt frissítése sikertelen',
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
                watchedType === 'tip'
                  ? 'bg-green-500/20 text-green-400'
                  : watchedType === 'discussion'
                    ? 'bg-blue-500/20 text-blue-400'
                    : watchedType === 'news'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-orange-500/20 text-orange-400'
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4'></div>
          <p className='text-gray-400'>Poszt betöltése...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !post) {
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
                Poszt szerkesztése
              </h1>
              <p className='text-gray-400'>Frissítse a poszt tartalmát és részleteit</p>
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
                    placeholder='Adjon meg egy figyelemfelkeltő címet...'
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
                      <SelectValue placeholder='Válassza ki a poszt típusát' />
                    </SelectTrigger>
                    <SelectContent className='bg-gray-800 border-gray-600'>
                      <SelectItem value='tip'>🎯 Tipp</SelectItem>
                      <SelectItem value='discussion'>💬 Beszélgetés</SelectItem>
                      <SelectItem value='news'>📰 Hírek</SelectItem>
                      <SelectItem value='analysis'>📊 Elemzés</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className='text-red-400 text-sm'>{errors.type.message}</p>}
                </div>

                {/* Tip-specific fields */}
                {watchedType === 'tip' && (
                  <div className='space-y-4 p-4 bg-green-900/20 rounded-lg border border-green-700'>
                    <h3 className='text-green-400 font-medium'>Tipp részletei</h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='odds' className='text-gray-300'>
                          Odds
                        </Label>
                        <Input
                          id='odds'
                          type='number'
                          step='0.01'
                          min='1.01'
                          max='1000'
                          {...register('odds', { valueAsNumber: true })}
                          placeholder='2.50'
                          className='bg-gray-800 border-gray-600 text-white'
                        />
                        {errors.odds && (
                          <p className='text-red-400 text-sm'>{errors.odds.message}</p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='stake' className='text-gray-300'>
                          Tét (1-10)
                        </Label>
                        <Input
                          id='stake'
                          type='number'
                          min='1'
                          max='10'
                          {...register('stake', { valueAsNumber: true })}
                          placeholder='5'
                          className='bg-gray-800 border-gray-600 text-white'
                        />
                        {errors.stake && (
                          <p className='text-red-400 text-sm'>{errors.stake.message}</p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='confidence' className='text-gray-300'>
                          Bizalom (1-5)
                        </Label>
                        <Input
                          id='confidence'
                          type='number'
                          min='1'
                          max='5'
                          {...register('confidence', { valueAsNumber: true })}
                          placeholder='4'
                          className='bg-gray-800 border-gray-600 text-white'
                        />
                        {errors.confidence && (
                          <p className='text-red-400 text-sm'>{errors.confidence.message}</p>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='betting_market' className='text-gray-300'>
                        Fogadási piac
                      </Label>
                      <Input
                        id='betting_market'
                        {...register('betting_market')}
                        placeholder='pl. Győztes, Over/Under 2.5, stb.'
                        className='bg-gray-800 border-gray-600 text-white'
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className='space-y-2'>
                  <Label htmlFor='content' className='text-gray-300'>
                    Tartalom *
                  </Label>
                  <Textarea
                    id='content'
                    {...register('content')}
                    placeholder='Írja le részletesen a gondolatait, tippjeit...'
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
                    placeholder='Címkék vesszővel elválasztva (pl. futball, premier league, tipp)'
                    defaultValue={''}
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
                        Frissítés...
                      </>
                    ) : (
                      <>
                        <Save className='h-4 w-4 mr-2' />
                        Poszt frissítése
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

            {/* Tips */}
            <Card className='bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700'>
              <CardHeader>
                <CardTitle className='text-blue-400'>Szerkesztési tippek</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm text-gray-300'>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>
                    A poszt típusának megváltoztatása törölheti a típus-specifikus mezőket
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>Tippek esetén pontosítsa az odds és tét adatokat</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>Frissítse a címkéket a jobb találhatóság érdekében</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400'>•</span>
                  <span>Az előnézet segít ellenőrizni a végeredményt</span>
                </div>
              </CardContent>
            </Card>

            {/* Post history */}
            {post && (
              <Card className='bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-700'>
                <CardHeader>
                  <CardTitle className='text-gray-400'>Poszt adatok</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm text-gray-400'>
                  <div className='flex justify-between'>
                    <span>Létrehozva:</span>
                    <span>{new Date(post.created_at).toLocaleDateString('hu-HU')}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Utolsó módosítás:</span>
                    <span>{new Date(post.updated_at).toLocaleDateString('hu-HU')}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Megtekintések:</span>
                    <span>{post.views_count}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Kedvelések:</span>
                    <span>{post.likes_count}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
