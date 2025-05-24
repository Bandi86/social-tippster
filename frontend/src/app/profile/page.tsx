'use client';

import AuthGuard from '@/components/auth/auth-guard';
import BaseLayout from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserService } from '@/features/user/user-service';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: 'Current password must be at least 8 characters' }),
    newPassword: z.string().min(8, { message: 'New password must be at least 8 characters' }),
    confirmNewPassword: z
      .string()
      .min(8, { message: 'Confirm password must be at least 8 characters' }),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: UserService.updateProfile,
    onSuccess: () => {
      setProfileSuccess('Profile updated successfully');
      setProfileError(null);
    },
    onError: (error: any) => {
      setProfileError(
        error?.response?.data?.message || 'Failed to update profile. Please try again.',
      );
      setProfileSuccess(null);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: UserService.changePassword,
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully');
      setPasswordError(null);
      resetPassword();
    },
    onError: (error: any) => {
      setPasswordError(
        error?.response?.data?.message || 'Failed to change password. Please try again.',
      );
      setPasswordSuccess(null);
    },
  });

  const onSubmitProfile = (data: ProfileFormValues) => {
    setProfileSuccess(null);
    setProfileError(null);
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormValues) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    changePasswordMutation.mutate(data);
  };

  return (
    <AuthGuard>
      <BaseLayout>
        <div className='max-w-4xl mx-auto space-y-8'>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h1 className='text-2xl font-bold mb-6'>Your Profile</h1>

            {profileSuccess && (
              <div className='mb-4 p-3 bg-green-50 text-green-600 rounded-md'>{profileSuccess}</div>
            )}

            {profileError && (
              <div className='mb-4 p-3 bg-red-50 text-red-500 rounded-md'>{profileError}</div>
            )}

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='name' className='text-sm font-medium'>
                  Name
                </label>
                <Input
                  id='name'
                  {...registerProfile('name')}
                  className={profileErrors.name ? 'border-red-500' : ''}
                />
                {profileErrors.name && (
                  <span className='text-sm text-red-500'>{profileErrors.name.message}</span>
                )}
              </div>

              <div className='space-y-2'>
                <label htmlFor='email' className='text-sm font-medium'>
                  Email
                </label>
                <Input
                  id='email'
                  type='email'
                  {...registerProfile('email')}
                  className={profileErrors.email ? 'border-red-500' : ''}
                />
                {profileErrors.email && (
                  <span className='text-sm text-red-500'>{profileErrors.email.message}</span>
                )}
              </div>

              <Button type='submit' disabled={isProfileSubmitting}>
                {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-bold mb-6'>Change Password</h2>

            {passwordSuccess && (
              <div className='mb-4 p-3 bg-green-50 text-green-600 rounded-md'>
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className='mb-4 p-3 bg-red-50 text-red-500 rounded-md'>{passwordError}</div>
            )}

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='currentPassword' className='text-sm font-medium'>
                  Current Password
                </label>
                <Input
                  id='currentPassword'
                  type='password'
                  {...registerPassword('currentPassword')}
                  className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                />
                {passwordErrors.currentPassword && (
                  <span className='text-sm text-red-500'>
                    {passwordErrors.currentPassword.message}
                  </span>
                )}
              </div>

              <div className='space-y-2'>
                <label htmlFor='newPassword' className='text-sm font-medium'>
                  New Password
                </label>
                <Input
                  id='newPassword'
                  type='password'
                  {...registerPassword('newPassword')}
                  className={passwordErrors.newPassword ? 'border-red-500' : ''}
                />
                {passwordErrors.newPassword && (
                  <span className='text-sm text-red-500'>{passwordErrors.newPassword.message}</span>
                )}
              </div>

              <div className='space-y-2'>
                <label htmlFor='confirmNewPassword' className='text-sm font-medium'>
                  Confirm New Password
                </label>
                <Input
                  id='confirmNewPassword'
                  type='password'
                  {...registerPassword('confirmNewPassword')}
                  className={passwordErrors.confirmNewPassword ? 'border-red-500' : ''}
                />
                {passwordErrors.confirmNewPassword && (
                  <span className='text-sm text-red-500'>
                    {passwordErrors.confirmNewPassword.message}
                  </span>
                )}
              </div>

              <Button type='submit' disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </div>
        </div>
      </BaseLayout>
    </AuthGuard>
  );
}
