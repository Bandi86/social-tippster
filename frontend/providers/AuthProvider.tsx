'use client';

import { useAuthStore } from '@/store/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const initializeAuth = useAuthStore(state => state.initialize);
  const isInitialized = useAuthStore(state => state.isInitialized);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Redirect to login if unauthenticated and not on a public/auth route
  useEffect(() => {
    if (
      isInitialized &&
      !isLoading &&
      !isAuthenticated &&
      pathname &&
      !pathname.startsWith('/auth') &&
      pathname !== '/' &&
      !pathname.startsWith('/posts') // Allow public access to posts
    ) {
      router.push('/auth');
      // Force re-initialize auth state after redirect
      initializeAuth();
    }
  }, [isInitialized, isLoading, isAuthenticated, pathname, router, initializeAuth]);

  // Always re-validate auth state on every route change
  useEffect(() => {
    initializeAuth();
  }, [pathname]);

  return <>{children}</>;
};
