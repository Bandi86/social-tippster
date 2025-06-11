'use client';

import { useAuthStore } from '@/store/auth/auth.store';
import { useState } from 'react';

interface LogoutButtonProps {
  onLogoutComplete?: () => void;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showConfirmDialog?: boolean;
  className?: string;
}

export default function LogoutButton({
  onLogoutComplete,
  variant = 'primary',
  size = 'md',
  showConfirmDialog = true,
  className = '',
}: LogoutButtonProps) {
  const { logout, isLoading, user } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    if (showConfirmDialog && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      await logout();
      onLogoutComplete?.();
      setShowConfirm(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const getButtonStyles = () => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantStyles = {
      primary:
        'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 border border-transparent',
      secondary:
        'bg-white hover:bg-gray-50 text-red-600 focus:ring-red-500 border border-red-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-red-400 dark:border-red-400',
      minimal:
        'bg-transparent hover:bg-red-50 text-red-600 focus:ring-red-500 dark:hover:bg-red-900/20 dark:text-red-400',
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  if (!user) {
    return null; // Don't render if user is not authenticated
  }

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={getButtonStyles()}
        type='button'
      >
        {isLoading ? (
          <>
            <svg
              className='animate-spin -ml-1 mr-2 h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            Signing out...
          </>
        ) : (
          <>
            <svg
              className='w-4 h-4 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            Sign Out
          </>
        )}
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6'>
            <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4'>
              <svg
                className='w-6 h-6 text-red-600 dark:text-red-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>

            <div className='text-center'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Confirm Sign Out
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
                Are you sure you want to sign out? You&apos;ll need to sign in again to access your
                account.
              </p>

              <div className='flex space-x-3'>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className='flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50'
                >
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
