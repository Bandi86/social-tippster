'use client';

import Navbar from '@/components/layout/navbar';
import { useAuth } from '@/hooks/use-auth';

interface BaseLayoutProps {
  children: React.ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-grow container mx-auto px-4 py-8 max-w-7xl'>{children}</main>
      <footer className='bg-gray-50 py-6 border-t'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <p className='text-center text-gray-500 text-sm'>
            &copy; {new Date().getFullYear()} Social Tippster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
