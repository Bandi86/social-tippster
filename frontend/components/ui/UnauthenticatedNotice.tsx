'use client';

import { AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface UnauthenticatedNoticeProps {
  message?: string;
  showLoginButton?: boolean;
  compact?: boolean;
}

export default function UnauthenticatedNotice({
  message = 'Jelentkezz be a teljes funkcionalitásért',
  showLoginButton = true,
  compact = false,
}: UnauthenticatedNoticeProps) {
  if (compact) {
    return (
      <div className='text-xs text-center text-gray-500 mt-2'>
        <Link href='/auth' className='text-amber-400 hover:text-amber-300 underline'>
          Bejelentkezés
        </Link>{' '}
        az interakcióhoz
      </div>
    );
  }

  return (
    <Alert className='border-amber-700/30 bg-amber-900/20'>
      <AlertCircle className='h-4 w-4 text-amber-400' />
      <AlertDescription className='text-amber-300'>
        <div className='flex items-center justify-between'>
          <span>{message}</span>
          {showLoginButton && (
            <Link href='/auth'>
              <Button
                size='sm'
                variant='outline'
                className='ml-3 border-amber-600 text-amber-400 hover:bg-amber-900/50'
              >
                <LogIn className='h-3 w-3 mr-1' />
                Bejelentkezés
              </Button>
            </Link>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
