'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { collectClientFingerprint } from '@/lib/deviceFingerprint';
import { RegisterData } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Shield, User, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import registerSchema, { RegisterFormData, RegisterFormProps } from './registerSchema';

export function RegisterFormNew({ onSuccess, redirectTo = '/auth/login' }: RegisterFormProps) {
  const { register: registerUser, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const watchAcceptTerms = watch('acceptTerms');
  const watchPassword = watch('password');

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      const registerData: RegisterData = {
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
      };
      const clientFingerprint = collectClientFingerprint();
      await registerUser(registerData);
      onSuccess?.();
      router.push(redirectTo);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Gyenge', color: 'bg-red-500' },
      { strength: 2, label: 'Közepes', color: 'bg-orange-500' },
      { strength: 3, label: 'Jó', color: 'bg-yellow-500' },
      { strength: 4, label: 'Erős', color: 'bg-green-500' },
      { strength: 5, label: 'Nagyon erős', color: 'bg-green-600' },
    ];

    return levels[strength] || levels[0];
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold text-white mb-2'>Regisztráció</h2>
        <p className='text-gray-400'>Csatlakozz a Tippster FC közösséghez!</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-500/20 border border-red-400 text-red-300 rounded-lg px-4 py-3 text-sm text-center mb-6'
          >
            {error}
          </motion.div>
        )}
        {/* Name fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName' className='text-sm font-medium text-white'>
              Keresztnév
            </Label>
            <div className='relative'>
              <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                id='firstName'
                placeholder='Keresztnév'
                {...register('firstName')}
                className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder-gray-400 transition-all duration-200 ${
                  errors.firstName
                    ? 'border-red-400 bg-red-500/10 focus:ring-red-400'
                    : 'focus:ring-yellow-500 focus:border-yellow-500'
                }`}
              />
            </div>
            {errors.firstName && (
              <p className='text-xs text-red-400 flex items-center gap-1'>
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='lastName' className='text-sm font-medium text-white'>
              Vezetéknév
            </Label>
            <div className='relative'>
              <UserCheck className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                id='lastName'
                placeholder='Vezetéknév'
                {...register('lastName')}
                className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder-gray-400 transition-all duration-200 ${
                  errors.lastName
                    ? 'border-red-400 bg-red-500/10 focus:ring-red-400'
                    : 'focus:ring-yellow-500 focus:border-yellow-500'
                }`}
              />
            </div>
            {errors.lastName && (
              <p className='text-xs text-red-400 flex items-center gap-1'>
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Username field */}
        <div className='space-y-2'>
          <Label htmlFor='username' className='text-sm font-medium text-white'>
            Felhasználónév
          </Label>
          <div className='relative'>
            <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
            <Input
              id='username'
              placeholder='Válassz egy egyedi becenevet'
              {...register('username')}
              className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder-gray-400 transition-all duration-200 ${
                errors.username
                  ? 'border-red-400 bg-red-500/10 focus:ring-red-400'
                  : 'focus:ring-yellow-500 focus:border-yellow-500'
              }`}
            />
          </div>
          {errors.username && (
            <p className='text-xs text-red-400 flex items-center gap-1'>
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email field */}
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-sm font-medium text-white'>
            E-mail cím
          </Label>
          <div className='relative'>
            <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
            <Input
              id='email'
              type='email'
              placeholder='pelda@email.com'
              {...register('email')}
              className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder-gray-400 transition-all duration-200 ${
                errors.email
                  ? 'border-red-400 bg-red-500/10 focus:ring-red-400'
                  : 'focus:ring-yellow-500 focus:border-yellow-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className='text-xs text-red-400 flex items-center gap-1'>{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className='space-y-2'>
          <Label htmlFor='password' className='text-sm font-medium text-white'>
            Jelszó
          </Label>
          <div className='relative'>
            <Shield className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Legalább 8 karakter'
              {...register('password')}
              className={`pl-10 pr-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder-gray-400 transition-all duration-200 ${
                errors.password
                  ? 'border-red-400 bg-red-500/10 focus:ring-red-400'
                  : 'focus:ring-yellow-500 focus:border-yellow-500'
              }`}
            />
            <button
              type='button'
              className='absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>

          {/* Password strength indicator */}
          {watchPassword && (
            <div className='space-y-2'>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className='text-xs text-gray-300'>
                Jelszó erőssége:{' '}
                <span className='font-medium text-white'>{passwordStrength.label}</span>
              </p>
            </div>
          )}

          {errors.password && (
            <p className='text-xs text-red-400 flex items-center gap-1'>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password field */}
        <div className='space-y-2'>
          <Label htmlFor='confirmPassword' className='text-sm font-medium text-white'>
            Jelszó megerősítése
          </Label>
          <div className='relative'>
            <Shield className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
            <Input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Írd be újra a jelszót'
              {...register('confirmPassword')}
              className={`pl-10 pr-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder-gray-400 transition-all duration-200 ${
                errors.confirmPassword
                  ? 'border-red-400 bg-red-500/10 focus:ring-red-400'
                  : 'focus:ring-yellow-500 focus:border-yellow-500'
              }`}
            />
            <button
              type='button'
              className='absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className='text-xs text-red-400 flex items-center gap-1'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className='space-y-3'>
          <div className='flex items-start space-x-3'>
            <Checkbox
              id='acceptTerms'
              checked={watchAcceptTerms}
              onCheckedChange={checked => setValue('acceptTerms', !!checked)}
              className='mt-1 border-white/30'
            />
            <Label htmlFor='acceptTerms' className='text-sm text-white leading-relaxed'>
              Elfogadom a{' '}
              <Link
                href='/terms'
                className='text-yellow-400 hover:text-yellow-300 underline font-medium'
              >
                Felhasználási feltételeket
              </Link>{' '}
              és az{' '}
              <Link
                href='/privacy'
                className='text-yellow-400 hover:text-yellow-300 underline font-medium'
              >
                Adatvédelmi szabályzatot
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className='text-xs text-red-400 flex items-center gap-1'>
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type='submit'
          disabled={isSubmitting || isLoading || !watchAcceptTerms}
          className='w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting || isLoading ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='w-5 h-5 animate-spin' />
              <span>Regisztráció...</span>
            </div>
          ) : (
            'Regisztrálok és belépek a meccsbe! ⚽'
          )}
        </Button>

        {/* Login link */}
        <div className='text-center pt-4 border-t border-white/20'>
          <p className='text-sm text-gray-300'>
            Már van fiókod?{' '}
            <button
              type='button'
              className='text-yellow-400 hover:text-yellow-300 font-medium underline transition-colors'
              onClick={() => onSuccess?.()}
            >
              Jelentkezz be itt!
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterFormNew;
