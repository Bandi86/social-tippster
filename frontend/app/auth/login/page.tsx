import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - SocialTippster',
  description: 'Sign in to your SocialTippster account',
};

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/50 p-4'>
      <LoginForm />
    </div>
  );
}
