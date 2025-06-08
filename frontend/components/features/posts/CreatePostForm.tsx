'use client';

import { AlertCircle, ImageIcon, Send, X } from 'lucide-react';
import { useState } from 'react';

import ImageUpload from '@/components/shared/ImageUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { CreatePostData } from '@/store/posts';

interface CreatePostFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function CreatePostForm({ onSubmit, onCancel }: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');
  const [formData, setFormData] = useState<CreatePostData>({
    content: '',
    type: 'general',
    isPremium: false,
    tags: [],
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState<string>('');

  const { isAuthenticated } = useAuth();
  const { createPost } = usePosts();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'A tartalom kötelező';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'A tartalom legalább 10 karakter hosszú legyen';
    }

    // Check if we have some content (text or image)
    if (!formData.content.trim() && !formData.imageUrl) {
      newErrors.content = 'Adj meg tartalmat vagy tölts fel egy képet';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Hiba',
        description: 'Be kell jelentkezned a posztoláshoz',
        variant: 'destructive',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for API - ensure we send the correct field names
      const postData = {
        content: formData.content,
        type: formData.type || 'general',
        tags: formData.tags || [],
        imageUrl: formData.imageUrl || undefined,
        isPremium: formData.isPremium || false,
        // Map frontend fields to backend fields
        commentsEnabled: true,
        sharingEnabled: true,
        status: 'published' as CreatePostData['status'],
        visibility: 'public' as CreatePostData['visibility'],
      };

      console.log('📤 Creating post with data:', postData);
      const result = await createPost(postData);

      // Only show success if the post was actually created
      if (result) {
        toast({
          title: 'Siker',
          description: 'Poszt sikeresen létrehozva!',
        });

        // Reset form
        setFormData({
          content: '',
          type: 'general',
          isPremium: false,
          tags: [],
          imageUrl: '',
        });
        setErrors({});
        setImageError('');
        setActiveTab('content');
        onSubmit?.();
      }
    } catch (error: unknown) {
      console.error('Poszt létrehozási hiba:', error);

      // Handle specific error types from the enhanced store error handling
      let errorTitle = 'Hiba';
      let errorDescription = 'A poszt létrehozása sikertelen';

      if (error && typeof error === 'object' && error !== null) {
        const errorObj = error as { code?: string; message?: string };

        // Handle enhanced API errors from the store
        if (errorObj.code === 'FILE_TOO_LARGE') {
          errorTitle = 'Fájl túl nagy';
          errorDescription =
            errorObj.message || 'A feltöltött fájl túl nagy. Maximum 5MB méret engedélyezett.';
          setImageError(errorDescription);
        } else if (errorObj.code === 'BAD_REQUEST') {
          errorTitle = 'Hibás kérés';
          errorDescription =
            errorObj.message ||
            'A küldött adatok hibásak. Kérjük ellenőrizd a megadott információkat.';
        } else if (errorObj.code === 'UNAUTHORIZED') {
          errorTitle = 'Nincs jogosultság';
          errorDescription = errorObj.message || 'Nincs jogosultságod a művelet végrehajtásához.';
        } else if (errorObj.code === 'FORBIDDEN') {
          errorTitle = 'Tiltott művelet';
          errorDescription = errorObj.message || 'A művelet végrehajtása nem engedélyezett.';
        } else if (errorObj.code === 'SERVER_ERROR') {
          errorTitle = 'Szerver hiba';
          errorDescription =
            errorObj.message || 'Szerver hiba történt. Kérjük próbáld újra később.';
        } else if (errorObj.message) {
          errorDescription = errorObj.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof CreatePostData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags?.includes(tag) && (formData.tags?.length || 0) < 5) {
      updateFormData('tags', [...(formData.tags || []), tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData(
      'tags',
      (formData.tags || []).filter(tag => tag !== tagToRemove),
    );
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageUpload = (imageUrl: string | null) => {
    updateFormData('imageUrl', imageUrl || '');
    setImageError('');
  };

  const handleImageError = (error: string) => {
    setImageError(error);
  };

  const getPostTypeInfo = (type: string) => {
    switch (type) {
      case 'general':
        return {
          label: 'Általános',
          description: 'Általános poszt vagy megosztás',
          color: 'bg-gray-600',
        };
      case 'discussion':
        return {
          label: 'Beszélgetés',
          description: 'Általános beszélgetés vagy kérdés',
          color: 'bg-blue-600',
        };
      case 'analysis':
        return {
          label: 'Elemzés',
          description: 'Részletes elemzés vagy statisztikák',
          color: 'bg-purple-600',
        };
      case 'help_request':
        return {
          label: 'Segítségkérés',
          description: 'Kérdés vagy segítség kérése',
          color: 'bg-orange-600',
        };
      case 'news':
        return {
          label: 'Hírek',
          description: 'Sport hírek vagy információk',
          color: 'bg-red-600',
        };
      case 'tip':
        return {
          label: 'Tipp',
          description: 'Sport tipp vagy jóslat',
          color: 'bg-green-600',
        };
      default:
        return {
          label: 'Ismeretlen',
          description: '',
          color: 'bg-gray-600',
        };
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
        <CardContent className='p-6 text-center'>
          <AlertCircle className='h-12 w-12 mx-auto mb-4 text-amber-400' />
          <h3 className='text-lg font-semibold text-white mb-2'>Bejelentkezés szükséges</h3>
          <p className='text-gray-400'>Jelentkezz be, hogy új posztot hozhass létre!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl text-white'>Új poszt létrehozása</CardTitle>
          {onCancel && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onCancel}
              className='text-gray-400 hover:text-white'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Type Selection */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-white'>Poszt típusa</label>
            <Select
              value={formData.type}
              onValueChange={value => updateFormData('type', value as CreatePostData['type'])}
            >
              <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
                <SelectValue placeholder='Válassz típust' />
              </SelectTrigger>
              <SelectContent className='bg-gray-800 border-gray-600'>
                {(
                  ['general', 'discussion', 'analysis', 'help_request', 'news', 'tip'] as const
                ).map(type => {
                  const info = getPostTypeInfo(type);
                  return (
                    <SelectItem key={type} value={type} className='text-white'>
                      <div className='flex items-center gap-2'>
                        <div className={`w-3 h-3 rounded-full ${info.color}`} />
                        <span>{info.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className='text-sm text-gray-400'>
              {getPostTypeInfo(formData.type || 'general').description}
            </p>
          </div>

          {/* Content with Tabs */}
          <div className='space-y-4'>
            <Tabs
              value={activeTab}
              onValueChange={value => setActiveTab(value as 'content' | 'media')}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2 bg-gray-700 border-gray-600'>
                <TabsTrigger
                  value='content'
                  className='text-white data-[state=active]:bg-amber-600'
                >
                  <Send className='h-4 w-4 mr-2' />
                  Tartalom
                </TabsTrigger>
                <TabsTrigger value='media' className='text-white data-[state=active]:bg-amber-600'>
                  <ImageIcon className='h-4 w-4 mr-2' />
                  Kép
                  {formData.imageUrl && <div className='w-2 h-2 bg-green-400 rounded-full ml-2' />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value='content' className='space-y-3'>
                <label className='text-sm font-medium text-white'>Poszt szövege</label>
                <Textarea
                  placeholder='Írd le a poszt tartalmát... (opcionális, ha képet töltesz fel)'
                  className='bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[120px]'
                  value={formData.content}
                  onChange={e => updateFormData('content', e.target.value)}
                />
                {errors.content && <p className='text-sm text-red-400'>{errors.content}</p>}
              </TabsContent>

              <TabsContent value='media' className='space-y-3'>
                <label className='text-sm font-medium text-white'>Kép feltöltése</label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={handleImageUpload}
                  onError={handleImageError}
                  maxSize={5}
                  className='w-full'
                  placeholder='Kattints ide vagy húzz ide egy képet'
                />
                {imageError && <p className='text-sm text-red-400'>{imageError}</p>}
                <p className='text-xs text-gray-400'>
                  A kép opcionális. Ha képet töltesz fel, akkor a szöveg nem kötelező.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Tags */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-white'>Címkék (max 5)</label>
            <div className='flex gap-2'>
              <Input
                placeholder={
                  formData.type === 'tip'
                    ? 'pl: barcelona, odds, la-liga'
                    : formData.type === 'analysis'
                      ? 'pl: statisztika, teljesítmény, forma'
                      : formData.type === 'news'
                        ? 'pl: transfer, eredmény, sérülés'
                        : 'pl: foci, meccs, eredmény'
                }
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className='bg-gray-700 border-gray-600 text-white flex-1'
                disabled={(formData.tags?.length || 0) >= 5}
              />
              <Button
                type='button'
                onClick={addTag}
                disabled={!tagInput.trim() || (formData.tags?.length || 0) >= 5}
                size='sm'
                className='bg-amber-600 hover:bg-amber-700'
              >
                Hozzáad
              </Button>
            </div>
            {(formData.tags?.length || 0) > 0 && (
              <div className='flex flex-wrap gap-2'>
                {formData.tags?.map((tag, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='bg-amber-600/20 text-amber-400 border-amber-600/50'
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='ml-2 text-amber-300 hover:text-white'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content Preview */}
          {formData.content && formData.imageUrl && (
            <div className='border border-gray-600 rounded-lg p-4 bg-gray-700/30'>
              <label className='text-sm font-medium text-white mb-3 block'>Előnézet</label>
              <div className='space-y-3'>
                <p className='text-gray-300 text-sm'>{formData.content}</p>
                <div className='w-full h-32 bg-gray-600 rounded overflow-hidden'>
                  <img
                    src={formData.imageUrl}
                    alt='Preview'
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Premium Toggle */}
          <div className='flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4 bg-gray-700/30'>
            <div className='space-y-0.5'>
              <div className='text-base text-white'>Prémium poszt</div>
              <div className='text-sm text-gray-400'>
                Csak prémium tagok láthatják ezt a posztot
              </div>
            </div>
            <Switch
              checked={formData.isPremium}
              onCheckedChange={checked => updateFormData('isPremium', checked)}
            />
          </div>

          {/* Post Summary */}
          <div className='bg-gray-700/30 rounded-lg p-3 border border-gray-600'>
            <div className='text-xs text-gray-400 space-y-1'>
              <div>
                Típus:{' '}
                <span className='text-amber-400'>
                  {getPostTypeInfo(formData.type || 'general').label}
                </span>
              </div>
              <div>
                Tartalom:{' '}
                <span className='text-white'>
                  {formData.content ? `${formData.content.length} karakter` : 'Nincs szöveg'}
                </span>
              </div>
              <div>
                Kép:{' '}
                <span className='text-white'>{formData.imageUrl ? 'Feltöltve' : 'Nincs kép'}</span>
              </div>
              <div>
                Címkék: <span className='text-white'>{formData.tags?.length || 0}/5</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex gap-3 pt-4'>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 bg-amber-600 hover:bg-amber-700'
            >
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Közzététel...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Send className='h-4 w-4' />
                  Poszt közzététele
                </div>
              )}
            </Button>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                className='border-gray-600 text-gray-300 hover:bg-gray-700'
              >
                Mégse
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
