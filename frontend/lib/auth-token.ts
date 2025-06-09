/**
 * Centralized Auth Token Access Utility
 * This provides a single source of truth for authentication token access
 * across all stores and components, eliminating the dual token storage issue.
 */

import { useAuthStore } from '@/store/auth';

/**
 * Get the current authentication token from the centralized auth store
 * This replaces direct localStorage access to ensure consistency
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Access token through Zustand store instead of localStorage
    const authStore = useAuthStore.getState();
    const token = authStore.tokens?.accessToken;

    if (token) {
      console.log('🔑 Auth token found in centralized store');
      return token;
    }

    // Don't show warning for guest users - this is normal behavior
    return null;
  } catch (error) {
    console.error('❌ Error accessing centralized auth token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated by verifying token and user exist
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const authStore = useAuthStore.getState();
    return authStore.isAuthenticated && !!authStore.tokens?.accessToken && !!authStore.user;
  } catch (error) {
    console.error('❌ Error checking authentication status:', error);
    return false;
  }
}

/**
 * Get the current user from the centralized auth store
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;

  try {
    const authStore = useAuthStore.getState();
    return authStore.user;
  } catch (error) {
    console.error('❌ Error accessing current user:', error);
    return null;
  }
}

/**
 * Check if the current user has admin privileges
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Check if the current user has moderator or admin privileges
 */
export function hasModeratorAccess(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin' || user?.role === 'moderator';
}
