'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface PasswordResetFormProps {
  token?: string;
}

export function PasswordResetForm({ token: propToken }: PasswordResetFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = propToken || searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('Password reset successfully! Redirecting to login...');
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className='w-full max-w-md mx-auto text-center'>
        <Alert className='border-red-500/50 bg-red-500/10'>
          <AlertDescription className='text-red-400'>
            Invalid or missing reset token. Please request a new password reset.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push('/auth/password-reset')}
          className='mt-4 bg-amber-500 hover:bg-amber-600 text-black'
        >
          Request New Reset
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md mx-auto space-y-6'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-white mb-2'>Set New Password</h2>
        <p className='text-gray-400'>Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='password' className='text-white'>
            New Password
          </Label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='Enter new password'
              required
              className='bg-gray-900 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500 pr-10'
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4 text-gray-400' />
              ) : (
                <Eye className='h-4 w-4 text-gray-400' />
              )}
            </Button>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='confirmPassword' className='text-white'>
            Confirm Password
          </Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder='Confirm new password'
              required
              className='bg-gray-900 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500 pr-10'
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4 text-gray-400' />
              ) : (
                <Eye className='h-4 w-4 text-gray-400' />
              )}
            </Button>
          </div>
        </div>

        {message && (
          <Alert
            className={
              isSuccess ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
            }
          >
            {isSuccess && <CheckCircle className='h-4 w-4' />}
            <AlertDescription className={isSuccess ? 'text-green-400' : 'text-red-400'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type='submit'
          disabled={isLoading || isSuccess}
          className='w-full bg-amber-500 hover:bg-amber-600 text-black font-medium'
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </div>
  );
}
