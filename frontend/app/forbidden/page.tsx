'use client';

import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Home, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className='min-h-screen bg-black flex items-center justify-center px-4'>
      <div className='max-w-md w-full space-y-8 text-center'>
        <div>
          <div className='mx-auto h-24 w-24 text-red-500 mb-6'>
            <Shield className='h-full w-full' />
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-white'>Access Forbidden</h2>
          <p className='mt-2 text-sm text-gray-400'>
            You don&apos;t have permission to access this page.
          </p>
        </div>

        <div className='mt-8 space-y-4'>
          <div className='bg-gray-900 border border-red-500/20 rounded-lg p-6'>
            <h3 className='text-lg font-medium text-red-400 mb-2'>Admin Access Required</h3>
            <p className='text-gray-300 text-sm'>
              This page is restricted to administrators only.
              {isAuthenticated && user ? (
                <>
                  <br />
                  <span className='text-amber-400'>Current role:</span> {user.role}
                </>
              ) : (
                <>
                  <br />
                  Please log in with an admin account.
                </>
              )}
            </p>
          </div>

          <div className='flex flex-col space-y-3'>
            <button
              onClick={() => router.back()}
              className='inline-flex justify-center items-center px-4 py-2 border border-amber-500 text-amber-400 bg-transparent hover:bg-amber-500/10 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Go Back
            </button>

            <Link
              href='/dashboard'
              className='inline-flex justify-center items-center px-4 py-2 border border-white text-white bg-transparent hover:bg-white hover:text-black font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200'
            >
              <Home className='h-4 w-4 mr-2' />
              Go to Dashboard
            </Link>

            {!isAuthenticated && (
              <Link
                href='/auth/login'
                className='inline-flex justify-center items-center px-4 py-2 bg-amber-500 text-black hover:bg-amber-400 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200'
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
