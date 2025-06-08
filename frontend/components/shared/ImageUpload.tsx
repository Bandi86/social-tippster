'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertCircle, Camera, Crop, ImageIcon, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { DragEvent, useCallback, useRef, useState } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string | null) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface ImagePreview {
  url: string;
  file: File;
  size: number;
}

const DEFAULT_ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_MAX_SIZE = 5; // 5MB

export default function ImageUpload({
  value,
  onChange,
  onError,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  className,
  disabled = false,
  placeholder = 'Kattints ide vagy húzz ide egy képet',
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedFormats.includes(file.type)) {
        return `Nem támogatott fájlformátum. Elfogadott formátumok: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`;
      }

      if (file.size > maxSize * 1024 * 1024) {
        return `A fájl túl nagy. Maximum méret: ${maxSize}MB`;
      }

      return null;
    },
    [acceptedFormats, maxSize],
  );

  // Handle file processing
  const processFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        toast({
          title: 'Érvénytelen fájl',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);

      try {
        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview({ url: previewUrl, file, size: file.size });

        // Upload to server
        const formData = new FormData();
        formData.append('file', file);

        // Get auth token from localStorage
        const authToken = localStorage.getItem('authToken');
        const headers: HeadersInit = {};
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch('http://localhost:3001/api/uploads/post', {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          // Handle specific HTTP error codes
          if (response.status === 413) {
            throw new Error('A feltöltött fájl túl nagy. Maximum 5MB méret engedélyezett.');
          } else if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Érvénytelen fájlformátum vagy méret.');
          } else {
            throw new Error('Hiba történt a fájl feltöltése során.');
          }
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        // Use the server-provided URL
        onChange(result.url);

        toast({
          title: 'Kép feltöltve',
          description: 'A kép sikeresen feltöltésre került.',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Képfeldolgozási hiba történt';
        onError?.(errorMessage);
        toast({
          title: 'Hiba',
          description: errorMessage,
          variant: 'destructive',
        });

        // Clear preview on error
        if (preview) {
          URL.revokeObjectURL(preview.url);
          setPreview(null);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onChange, onError, preview],
  );

  // Drag and drop handlers
  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, processFile],
  );

  // File input handler
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  // Remove image
  const handleRemove = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [preview, onChange]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show preview if we have a value or preview
  const showPreview = value || preview;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {!showPreview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-amber-500 hover:bg-amber-500/5',
            isDragOver && 'border-amber-500 bg-amber-500/10',
            disabled && 'opacity-50 cursor-not-allowed',
            'border-gray-600 bg-gray-800/50',
          )}
        >
          {isUploading ? (
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='h-8 w-8 animate-spin text-amber-400' />
              <p className='text-sm text-gray-300'>Kép feldolgozása...</p>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Camera className='h-6 w-6 text-gray-400' />
                <Upload className='h-6 w-6 text-gray-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-white'>{placeholder}</p>
                <p className='text-xs text-gray-400 mt-1'>
                  Támogatott formátumok:{' '}
                  {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
                </p>
                <p className='text-xs text-gray-400'>Maximum méret: {maxSize}MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <div className='relative'>
          <div className='relative rounded-lg overflow-hidden bg-gray-800 border border-gray-600'>
            <Image
              src={value || preview?.url || ''}
              alt='Előnézet'
              width={400}
              height={300}
              className='w-full h-48 object-cover'
              unoptimized={!!preview} // Don't optimize preview images
            />

            {/* Overlay with actions */}
            <div className='absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
              <Button
                size='sm'
                variant='secondary'
                onClick={openFileDialog}
                disabled={disabled}
                className='bg-white/20 hover:bg-white/30 text-white border-white/20'
              >
                <Crop className='h-4 w-4 mr-1' />
                Csere
              </Button>
              <Button
                size='sm'
                variant='destructive'
                onClick={handleRemove}
                disabled={disabled}
                className='bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/20'
              >
                <X className='h-4 w-4 mr-1' />
                Törlés
              </Button>
            </div>
          </div>

          {/* File info */}
          {preview && (
            <div className='mt-2 flex items-center gap-2 text-xs text-gray-400'>
              <ImageIcon className='h-3 w-3' />
              <span>{preview.file.name}</span>
              <span>•</span>
              <span>{formatFileSize(preview.size)}</span>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        className='hidden'
        disabled={disabled}
      />

      {/* Error display */}
      {onError && (
        <div className='flex items-center gap-2 text-sm text-red-400'>
          <AlertCircle className='h-4 w-4' />
          <span>Ellenőrizd a képfájlt és próbáld újra.</span>
        </div>
      )}
    </div>
  );
}
