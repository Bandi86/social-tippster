'use client';

import Navbar from '@/components/layout/navbar';

interface BaseLayoutProps {
  children: React.ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
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
