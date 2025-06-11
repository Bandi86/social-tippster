'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
          type='button'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        {/* Modal Content */}
        <div className='p-6'>
          {mode === 'login' ? (
            <LoginForm onSuccess={handleAuthSuccess} onSwitchToRegister={handleSwitchMode} />
          ) : (
            <RegisterForm onSuccess={handleAuthSuccess} onSwitchToLogin={handleSwitchMode} />
          )}
        </div>
      </div>
    </div>
  );
}
