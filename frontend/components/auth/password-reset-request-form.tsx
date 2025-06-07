'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('Password reset email sent! Check your inbox.');
      setIsSuccess(true);
    } catch (error) {
      setMessage('Failed to send reset email. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto space-y-6'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-white mb-2'>Reset Password</h2>
        <p className='text-gray-400'>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-white'>
            Email Address
          </Label>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='Enter your email'
            required
            className='bg-gray-900 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500'
          />
        </div>

        {message && (
          <Alert
            className={
              isSuccess ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
            }
          >
            <Mail className='h-4 w-4' />
            <AlertDescription className={isSuccess ? 'text-green-400' : 'text-red-400'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full bg-amber-500 hover:bg-amber-600 text-black font-medium'
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Sending...
            </>
          ) : (
            'Send Reset Email'
          )}
        </Button>

        <div className='text-center'>
          <Button
            type='button'
            variant='link'
            onClick={() => router.push('/auth')}
            className='text-amber-400 hover:text-amber-300'
          >
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  );
}
