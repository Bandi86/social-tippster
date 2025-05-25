'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/features/auth/auth-service';
import { RegisterFormValues, registerSchema } from '@/features/auth/schemas';
import { useAuthStore } from '@/store/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setAuthenticated, setAccessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: data => {
      setUser(data.user);
      setAuthenticated(true);
      setAccessToken(data.accessToken);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to register. Please try again.');
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className='w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Create an account</h1>
        <p className='mt-2 text-gray-600'>Sign up to join our community</p>
      </div>

      {error && <div className='bg-red-50 text-red-500 p-3 rounded-md text-sm'>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <label htmlFor='name' className='text-sm font-medium'>
            Name
          </label>
          <Input
            id='name'
            type='text'
            placeholder='Your name'
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <span className='text-sm text-red-500'>{errors.name.message}</span>}
        </div>

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

        <div className='space-y-2'>
          <label htmlFor='confirmPassword' className='text-sm font-medium'>
            Confirm Password
          </label>
          <Input
            id='confirmPassword'
            type='password'
            placeholder='Confirm your password'
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <span className='text-sm text-red-500'>{errors.confirmPassword.message}</span>
          )}
        </div>

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </Button>

        <div className='text-center text-sm'>
          <span className='text-gray-600'>Already have an account? </span>
          <Link href='/login' className='text-blue-600 hover:underline'>
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
