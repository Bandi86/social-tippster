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
import { Eye, EyeOff, Loader2, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import registerSchema, { RegisterFormData, RegisterFormProps } from './registerSchema';

export function RegisterFormNew({ onSuccess, redirectTo = '/auth' }: RegisterFormProps) {
  const { register: registerUser, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const nativeCheckboxRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (nativeCheckboxRef.current) {
      nativeCheckboxRef.current.checked = watchAcceptTerms;
    }
  }, [watchAcceptTerms]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const deviceFingerprint = await collectClientFingerprint();

      const registerData: RegisterData = {
        username: data.username,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
        deviceFingerprint,
      };

      await registerUser(registerData);
      onSuccess?.();
      router.push(redirectTo);
    } catch (err) {
      console.error('Registration failed:', err);
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
    <div className='w-full' data-testid='register-form-main'>
      <div className='text-center mb-2'>
        <h2 className='text-lg font-bold text-white mb-0.5'>Regisztráció</h2>
        <p className='text-gray-400 text-xs'>Csatlakozz a közösséghez!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-500/20 border border-red-400 text-red-300 rounded-lg px-3 py-2 text-sm text-center'
          >
            {error}
          </motion.div>
        )}

        {/* Name fields in grid */}
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <Input
              placeholder='Keresztnév'
              {...register('firstName')}
              className={`h-9 px-3 py-2 text-sm bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 ${
                errors.firstName ? 'border-red-400' : 'focus:border-amber-500'
              }`}
            />
            {errors.firstName && (
              <p className='text-xs text-red-400 mt-1'>{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder='Vezetéknév'
              {...register('lastName')}
              className={`h-9 px-3 py-2 text-sm bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 ${
                errors.lastName ? 'border-red-400' : 'focus:border-amber-500'
              }`}
            />
            {errors.lastName && (
              <p className='text-xs text-red-400 mt-1'>{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div>
          <Input
            placeholder='Felhasználónév'
            {...register('username')}
            className={`h-9 px-3 py-2 text-sm bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 ${
              errors.username ? 'border-red-400' : 'focus:border-amber-500'
            }`}
          />
          {errors.username && (
            <p className='text-xs text-red-400 mt-1'>{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <div className='relative'>
            <Input
              type='email'
              placeholder='Email cím'
              {...register('email')}
              className={`h-9 px-3 py-2 pl-10 text-sm bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 ${
                errors.email ? 'border-red-400' : 'focus:border-amber-500'
              }`}
            />
            <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          </div>
          {errors.email && <p className='text-xs text-red-400 mt-1'>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className='relative'>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Jelszó'
              {...register('password')}
              className={`h-9 px-3 py-2 pl-10 pr-10 text-sm bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 ${
                errors.password ? 'border-red-400' : 'focus:border-amber-500'
              }`}
            />
            <Shield className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
            >
              {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
          {watchPassword && (
            <div className='mt-1 flex items-center gap-2'>
              <div className='flex-1 bg-gray-700 rounded-full h-1'>
                <div
                  className={`h-1 rounded-full transition-all ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
              <span className='text-xs text-gray-400'>{passwordStrength.label}</span>
            </div>
          )}
          {errors.password && (
            <p className='text-xs text-red-400 mt-1'>{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className='relative'>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Jelszó megerősítése'
              {...register('confirmPassword')}
              className={`h-9 px-3 py-2 pl-10 pr-10 text-sm bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 ${
                errors.confirmPassword ? 'border-red-400' : 'focus:border-amber-500'
              }`}
            />
            <Shield className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
            >
              {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className='text-xs text-red-400 mt-1'>{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms checkbox */}
        <div className='flex items-start space-x-2'>
          <Checkbox
            id='terms'
            checked={watchAcceptTerms}
            onCheckedChange={checked => setValue('acceptTerms', !!checked)}
            className='mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500'
          />
          <Label htmlFor='terms' className='text-xs text-gray-300 leading-4'>
            Elfogadom a{' '}
            <Link href='/terms' className='text-amber-400 hover:text-amber-300'>
              Felhasználási Feltételeket
            </Link>{' '}
            és az{' '}
            <Link href='/privacy' className='text-amber-400 hover:text-amber-300'>
              Adatvédelmi Szabályzatot
            </Link>
          </Label>
        </div>
        {errors.acceptTerms && <p className='text-xs text-red-400'>{errors.acceptTerms.message}</p>}

        {/* Submit button */}
        <Button
          type='submit'
          disabled={isLoading || isSubmitting || !watchAcceptTerms}
          className='w-full h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-400 text-black font-medium transition-colors'
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Regisztráció...
            </>
          ) : (
            'Regisztráció'
          )}
        </Button>
      </form>
    </div>
  );
}

export default RegisterFormNew;
