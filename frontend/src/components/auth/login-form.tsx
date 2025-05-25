'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/features/auth/auth-service';
import { LoginFormValues, loginSchema } from '@/features/auth/schemas';
import { useAuthStore } from '@/store/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setAuthenticated, setAccessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: data => {
      setUser(data.user);
      setAuthenticated(true);
      setAccessToken(data.accessToken);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to login. Please try again.');
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className='w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Login to your account</h1>
        <p className='mt-2 text-gray-600'>Enter your credentials to access your account</p>
      </div>

      {error && <div className='bg-red-50 text-red-500 p-3 rounded-md text-sm'>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <label htmlFor='email' className='text-sm font-medium'>
            Email
          </label>
          <Input
            id='email'
            type='email'
            placeholder='Your email'
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <span className='text-sm text-red-500'>{errors.email.message}</span>}
        </div>

        <div className='space-y-2'>
          <label htmlFor='password' className='text-sm font-medium'>
            Password
          </label>
          <Input
            id='password'
            type='password'
            placeholder='Your password'
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <span className='text-sm text-red-500'>{errors.password.message}</span>
          )}
        </div>

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>

        <div className='text-center text-sm'>
          <span className='text-gray-600'>Don't have an account? </span>
          <Link href='/register' className='text-blue-600 hover:underline'>
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
