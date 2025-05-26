import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Social Tippster',
  description: 'Request a password reset for your Social Tippster account',
};

export default function PasswordResetRequestPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <PasswordResetRequestForm />
      </div>
    </div>
  );
}
