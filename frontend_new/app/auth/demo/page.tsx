'use client';

import {
  AuthModal,
  LoginForm,
  LogoutButton,
  RegisterForm,
  UserProfile,
  useAuthStore,
} from '@/components/auth';
import { useState } from 'react';

export default function AuthDemo() {
  const { isAuthenticated, user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const openLoginModal = () => {
    setModalMode('login');
    setShowModal(true);
  };

  const openRegisterModal = () => {
    setModalMode('register');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
            Authentication Demo
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Test the authentication components with session-based auth
          </p>
        </div>

        {!isAuthenticated ? (
          <div className='space-y-8'>
            {/* Welcome Section */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
                Welcome! Please sign in or create an account
              </h2>

              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button
                  onClick={openLoginModal}
                  className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors'
                >
                  Sign In
                </button>
                <button
                  onClick={openRegisterModal}
                  className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors'
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Inline Forms Demo */}
            <div className='grid md:grid-cols-2 gap-8'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center'>
                  Login Form
                </h3>
                <LoginForm onSuccess={() => alert('Login successful!')} />
              </div>

              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center'>
                  Register Form
                </h3>
                <RegisterForm onSuccess={() => alert('Registration successful! Please login.')} />
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-8'>
            {/* User Dashboard */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                    Welcome back, {user?.username}!
                  </h2>
                  <p className='text-gray-600 dark:text-gray-400'>You are successfully signed in</p>
                </div>

                <div className='flex gap-2'>
                  <LogoutButton
                    variant='secondary'
                    size='md'
                    onLogoutComplete={() => alert('Logged out successfully!')}
                  />
                  <LogoutButton
                    variant='minimal'
                    size='sm'
                    showConfirmDialog={false}
                    onLogoutComplete={() => alert('Quick logout!')}
                  />
                </div>
              </div>
            </div>

            {/* User Profile Variants */}
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                  Basic Profile
                </h3>
                <UserProfile />
              </div>

              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                  Full Profile
                </h3>
                <UserProfile showEmail={true} showRole={true} showLastOnline={true} />
              </div>

              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                  Minimal Profile
                </h3>
                <UserProfile showEmail={false} showRole={false} showLastOnline={false} />
              </div>
            </div>

            {/* Session Info */}
            <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
              <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                Session Information
              </h3>
              <div className='text-sm text-blue-800 dark:text-blue-200 space-y-1'>
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Role: {user?.role}</p>
                <p>Status: {user?.isActive ? 'Active' : 'Inactive'}</p>
                {user?.isOnline !== undefined && <p>Online: {user.isOnline ? 'Yes' : 'No'}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showModal}
          onClose={closeModal}
          initialMode={modalMode}
          onAuthSuccess={() => alert('Authentication successful!')}
        />

        {/* Footer */}
        <div className='mt-12 text-center text-sm text-gray-500 dark:text-gray-400'>
          <p>
            This demo showcases the authentication components with session-based auth and Redis
            caching.
          </p>
        </div>
      </div>
    </div>
  );
}
