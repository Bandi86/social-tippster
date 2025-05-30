// Magyar: Közös betöltési állapotok komponensei
// Shared loading state components to maintain consistency

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquare, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

/**
 * Magyar: Általános betöltési skeleton
 */
export function LoadingSkeleton({ count = 4, height = 'h-20', className }: LoadingSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-4 py-12', className)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={cn(height, 'bg-gray-800 rounded animate-pulse')} />
      ))}
      <span className='mx-auto text-gray-400'>Betöltés...</span>
    </div>
  );
}

interface CenteredLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Magyar: Központosított betöltési indikátor
 */
export function CenteredLoading({ message = 'Betöltés...', size = 'md' }: CenteredLoadingProps) {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-center gap-2'>
          <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
          <span>{message}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * Magyar: Üres állapot komponens
 */
export function EmptyState({
  icon: Icon = MessageSquare,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg',
        className,
      )}
    >
      <CardContent className='p-8 text-center'>
        <div className='text-gray-400 mb-4'>
          <Icon className='h-12 w-12 mx-auto mb-3 opacity-50' />
          <p className='text-lg font-medium mb-2'>{title}</p>
          {description && <p className='text-sm'>{description}</p>}
        </div>
        {action &&
          (action.href ? (
            <Link href={action.href}>
              <Button className='bg-amber-600 hover:bg-amber-700 rounded-lg shadow-md'>
                <Plus className='h-4 w-4 mr-2' />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className='bg-amber-600 hover:bg-amber-700 rounded-lg shadow-md'
            >
              <Plus className='h-4 w-4 mr-2' />
              {action.label}
            </Button>
          ))}
      </CardContent>
    </Card>
  );
}

interface SearchEmptyStateProps {
  searchQuery: string;
  onClear?: () => void;
}

/**
 * Magyar: Keresési eredmény üres állapot
 */
export function SearchEmptyState({ searchQuery, onClear }: SearchEmptyStateProps) {
  return (
    <EmptyState
      icon={Search}
      title={`Nincs találat a keresésre: "${searchQuery}"`}
      description='Próbálj más kulcsszavakat vagy módosítsd a szűrőket.'
      action={
        onClear
          ? {
              label: 'Keresés törlése',
              onClick: onClear,
            }
          : undefined
      }
    />
  );
}

/**
 * Magyar: Spinner inline használathoz
 */
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return <Loader2 className={cn(sizes[size], 'animate-spin')} />;
}

/**
 * Magyar: Betöltés gomb (load more)
 */
interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadMoreButton({
  onClick,
  isLoading,
  disabled = false,
  children,
  className,
}: LoadMoreButtonProps) {
  return (
    <div className='flex justify-center'>
      <Button
        variant='outline'
        onClick={onClick}
        disabled={isLoading || disabled}
        className={cn(
          'border-amber-600 text-amber-400 hover:bg-amber-900/50 rounded-lg shadow-md',
          className,
        )}
      >
        {isLoading ? (
          <>
            <InlineSpinner size='sm' />
            <span className='ml-2'>Betöltés...</span>
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
