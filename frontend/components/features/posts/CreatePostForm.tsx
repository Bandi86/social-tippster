'use client';

import { AlertCircle, Send, X } from 'lucide-react';
import { useState } from 'react';

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

export default function CreatePostForm({
  onSubmit,
  onCancel,
  compact = false,
}: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    content: '',
    type: 'discussion',
    is_premium: false,
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isAuthenticated } = useAuth();
  const { createPost } = usePosts();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'A cím kötelező';
    } else if (formData.title.length > 255) {
      newErrors.title = 'A cím túl hosszú';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'A tartalom kötelező';
    }

    if (formData.type === 'tip') {
      if (formData.odds && (formData.odds < 1.01 || formData.odds > 1000)) {
        newErrors.odds = 'Az odds 1.01 és 1000 között kell legyen';
      }
      if (formData.stake && (formData.stake < 1 || formData.stake > 10)) {
        newErrors.stake = 'A tét 1 és 10 között kell legyen';
      }
      if (formData.confidence && (formData.confidence < 1 || formData.confidence > 5)) {
        newErrors.confidence = 'A bizalom 1 és 5 között kell legyen';
      }
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
      await createPost(formData);
      toast({
        title: 'Siker',
        description: 'Poszt sikeresen létrehozva!',
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        type: 'discussion',
        is_premium: false,
        tags: [],
      });
      setErrors({});
      onSubmit?.();
    } catch (error) {
      console.error('Poszt létrehozási hiba:', error);
      toast({
        title: 'Hiba',
        description: 'A poszt létrehozása sikertelen',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof CreatePostData, value: any) => {
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

  const getPostTypeInfo = (type: string) => {
    switch (type) {
      case 'tip':
        return {
          label: 'Tipp',
          description: 'Fogadási tipp vagy előrejelzés',
          color: 'bg-green-600',
        };
      case 'discussion':
        return {
          label: 'Beszélgetés',
          description: 'Általános beszélgetés vagy kérdés',
          color: 'bg-blue-600',
        };
      case 'news':
        return {
          label: 'Hírek',
          description: 'Sport hírek vagy információk',
          color: 'bg-red-600',
        };
      case 'analysis':
        return {
          label: 'Elemzés',
          description: 'Részletes elemzés vagy statisztikák',
          color: 'bg-purple-600',
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
                {(['tip', 'discussion', 'news', 'analysis'] as const).map(type => {
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
            <p className='text-sm text-gray-400'>{getPostTypeInfo(formData.type).description}</p>
          </div>

          {/* Title */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-white'>Cím</label>
            <Input
              placeholder='Add meg a poszt címét...'
              className='bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
              value={formData.title}
              onChange={e => updateFormData('title', e.target.value)}
            />
            {errors.title && <p className='text-sm text-red-400'>{errors.title}</p>}
          </div>

          {/* Content */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-white'>Tartalom</label>
            <Textarea
              placeholder='Írd le a poszt tartalmát...'
              className='bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[120px]'
              value={formData.content}
              onChange={e => updateFormData('content', e.target.value)}
            />
            {errors.content && <p className='text-sm text-red-400'>{errors.content}</p>}
          </div>

          {/* Tip-specific fields */}
          {formData.type === 'tip' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/50 rounded-lg'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-white'>Odds</label>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='2.50'
                  className='bg-gray-700 border-gray-600 text-white'
                  value={formData.odds || ''}
                  onChange={e => updateFormData('odds', parseFloat(e.target.value) || undefined)}
                />
                {errors.odds && <p className='text-sm text-red-400'>{errors.odds}</p>}
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-white'>Tét (1-10)</label>
                <Input
                  type='number'
                  min='1'
                  max='10'
                  placeholder='5'
                  className='bg-gray-700 border-gray-600 text-white'
                  value={formData.stake || ''}
                  onChange={e => updateFormData('stake', parseInt(e.target.value) || undefined)}
                />
                {errors.stake && <p className='text-sm text-red-400'>{errors.stake}</p>}
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-white'>Bizalom (1-5)</label>
                <Input
                  type='number'
                  min='1'
                  max='5'
                  placeholder='3'
                  className='bg-gray-700 border-gray-600 text-white'
                  value={formData.confidence || ''}
                  onChange={e =>
                    updateFormData('confidence', parseInt(e.target.value) || undefined)
                  }
                />
                {errors.confidence && <p className='text-sm text-red-400'>{errors.confidence}</p>}
              </div>

              <div className='md:col-span-3 space-y-2'>
                <label className='text-sm font-medium text-white'>Fogadási piac</label>
                <Input
                  placeholder='pl. Match Winner, Over/Under 2.5...'
                  className='bg-gray-700 border-gray-600 text-white'
                  value={formData.betting_market || ''}
                  onChange={e => updateFormData('betting_market', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-white'>Címkék (max 5)</label>
            <div className='flex gap-2'>
              <Input
                placeholder='Adj hozzá címkét...'
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

          {/* Premium Toggle */}
          <div className='flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4 bg-gray-700/30'>
            <div className='space-y-0.5'>
              <div className='text-base text-white'>Prémium poszt</div>
              <div className='text-sm text-gray-400'>
                Csak prémium tagok láthatják ezt a posztot
              </div>
            </div>
            <Switch
              checked={formData.is_premium}
              onCheckedChange={checked => updateFormData('is_premium', checked)}
            />
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
