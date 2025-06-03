'use client';

import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // If on the main auth page or register page, render children without restrictions
  if (pathname === '/auth' || pathname === '/auth/register') {
    return <>{children}</>;
  }

  // Only for other auth pages like forgotten password, etc.
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4'>
      <div className='absolute top-4 left-4'>
        <Link href='/' className='text-lg font-bold'>
          Social Tippster
        </Link>
      </div>
      <Card className='max-w-md w-full p-6 sm:p-8 bg-background'>{children}</Card>
    </div>
  );
}
