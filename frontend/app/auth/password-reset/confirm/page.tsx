'use client';

import { PasswordResetForm } from '@/components/auth/password-reset-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PasswordResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center'>
            <AlertTriangle className='h-6 w-6 text-red-600' />
          </div>
          <CardTitle className='text-xl'>Invalid Reset Link</CardTitle>
          <CardDescription>This password reset link is invalid or has expired.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Please request a new password reset link if you still need to reset your password.
            </AlertDescription>
          </Alert>

          <div className='flex flex-col space-y-2'>
            <Button asChild>
              <Link href='/auth/password-reset'>Request New Reset Link</Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/auth/login'>Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <PasswordResetForm token={token} />;
}

export default function PasswordResetConfirmPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <Suspense
          fallback={
            <Card className='w-full max-w-md mx-auto'>
              <CardContent className='py-8'>
                <div className='flex items-center justify-center'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-b-transparent' />
                </div>
              </CardContent>
            </Card>
          }
        >
          <PasswordResetContent />
        </Suspense>
      </div>
    </div>
  );
}
