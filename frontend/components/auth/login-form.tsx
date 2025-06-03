'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { collectClientFingerprint } from '@/lib/deviceFingerprint';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, redirectTo = '/', onRegisterClick }: LoginFormProps) {
  const { login, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchRememberMe = watch('rememberMe');

  React.useEffect(() => {
    // Clear errors when component mounts
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      // Remove rememberMe for now since backend doesn't support it
      const loginCredentials = {
        email: data.email,
        password: data.password,
      };
      // Collect device fingerprint
      const clientFingerprint = collectClientFingerprint();
      await login(loginCredentials); // Only pass loginCredentials
      onSuccess?.();
      router.push(redirectTo);
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login failed:', error);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold text-white mb-2'>Bejelentkezés</h2>
        <p className='text-gray-400'>Lépj be a Tippster FC közösségbe!</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        {error && (
          <Alert variant='destructive' className='bg-red-500/10 border-red-400 text-red-400'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-white font-medium'>
            E-mail cím
          </Label>
          <div className='relative'>
            <Mail className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
            <Input
              id='email'
              type='email'
              placeholder='Add meg az e-mail címed'
              className='pl-11 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 h-12'
              {...register('email')}
            />
          </div>
          {errors.email && <p className='text-sm text-red-400'>{errors.email.message}</p>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password' className='text-white font-medium'>
            Jelszó
          </Label>
          <div className='relative'>
            <Lock className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Add meg a jelszavad'
              className='pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 h-12'
              {...register('password')}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-1 top-1 h-10 w-10 hover:bg-white/10 text-gray-400 hover:text-white'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </Button>
          </div>
          {errors.password && <p className='text-sm text-red-400'>{errors.password.message}</p>}
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='rememberMe'
              checked={watchRememberMe}
              onCheckedChange={checked => setValue('rememberMe', !!checked)}
              className='border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500'
            />
            <Label htmlFor='rememberMe' className='text-sm font-normal text-white'>
              Emlékezz rám
            </Label>
          </div>
          <Link
            href='/auth/forgot-password'
            className='text-sm text-blue-400 hover:text-blue-300 hover:underline'
          >
            Elfelejtett jelszó?
          </Link>
        </div>
        <Button
          type='submit'
          className='w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl'
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              Bejelentkezés...
            </>
          ) : (
            'Bejelentkezés'
          )}
        </Button>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t border-white/20' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-black/20 px-2 text-gray-400'>Új vagy nálunk?</span>
          </div>
        </div>
        <div className='text-center'>
          {onRegisterClick ? (
            <button
              type='button'
              className='text-yellow-400 hover:text-yellow-300 font-semibold hover:underline transition-colors'
              onClick={onRegisterClick}
            >
              Hozz létre fiókot
            </button>
          ) : (
            <Link
              href='/auth/register'
              className='text-yellow-400 hover:text-yellow-300 font-semibold hover:underline transition-colors'
            >
              Hozz létre fiókot
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
