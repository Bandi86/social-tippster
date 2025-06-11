'use client';

import { useAuthStore } from '@/store/auth/auth.store';
import { useCallback, useEffect } from 'react';

interface UseSessionOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onSessionExpired?: () => void;
  onSessionRefreshed?: () => void;
}

export function useSession(options: UseSessionOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    onSessionExpired,
    onSessionRefreshed,
  } = options;

  const {
    isAuthenticated,
    user,
    checkSession,
    refreshToken,
    updateActivity,
    sessionExpiration,
    lastActivity,
  } = useAuthStore();

  // Check if session is close to expiration
  const isNearExpiration = useCallback(() => {
    if (!sessionExpiration) return false;
    const now = Date.now();
    const timeUntilExpiry = sessionExpiration - now;
    return timeUntilExpiry < 2 * 60 * 1000; // Less than 2 minutes
  }, [sessionExpiration]);

  // Handle session refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshToken();
      onSessionRefreshed?.();
      console.log('🔄 Session refreshed automatically');
    } catch (error) {
      console.error('❌ Failed to refresh session:', error);
      onSessionExpired?.();
    }
  }, [refreshToken, onSessionRefreshed, onSessionExpired]);

  // Auto-refresh session
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(async () => {
      const isValid = await checkSession();

      if (!isValid) {
        onSessionExpired?.();
        return;
      }

      // Refresh if near expiration
      if (isNearExpiration()) {
        await handleRefresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [
    isAuthenticated,
    autoRefresh,
    refreshInterval,
    checkSession,
    isNearExpiration,
    handleRefresh,
    onSessionExpired,
  ]);

  // Update activity on user interaction
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      updateActivity();
    };

    // Listen for user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Calculate session time remaining
  const getTimeRemaining = useCallback(() => {
    if (!sessionExpiration) return null;
    const remaining = sessionExpiration - Date.now();
    return Math.max(0, remaining);
  }, [sessionExpiration]);

  // Format time remaining as human readable
  const getFormattedTimeRemaining = useCallback(() => {
    const timeRemaining = getTimeRemaining();
    if (!timeRemaining) return null;

    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [getTimeRemaining]);

  return {
    isAuthenticated,
    user,
    sessionExpiration,
    lastActivity,
    timeRemaining: getTimeRemaining(),
    formattedTimeRemaining: getFormattedTimeRemaining(),
    isNearExpiration: isNearExpiration(),
    refreshSession: handleRefresh,
    updateActivity,
  };
}
