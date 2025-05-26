import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - SocialTippster',
  description: 'Create your SocialTippster account',
};

export default function RegisterPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/50 p-4'>
      <RegisterForm />
    </div>
  );
}
