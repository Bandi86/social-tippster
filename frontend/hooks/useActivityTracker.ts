// filepath: frontend/hooks/useActivityTracker.ts
// ===============================
// Session Activity Tracker Hook
// Automatically tracks user activity and updates session state
// ===============================

import { useAuthStore } from '@/store/auth';
import { useCallback, useEffect, useRef } from 'react';

export interface ActivityTrackerConfig {
  /**
   * Throttle time for activity updates (in milliseconds)
   * @default 30000 (30 seconds)
   */
  throttleMs?: number;

  /**
   * Events to track for user activity
   * @default ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
   */
  events?: string[];

  /**
   * Whether to enable session expiry checking
   * @default true
   */
  enableExpiryCheck?: boolean;

  /**
   * Interval for checking session expiry (in milliseconds)
   * @default 60000 (1 minute)
   */
  expiryCheckInterval?: number;
}

export const useActivityTracker = (config: ActivityTrackerConfig = {}) => {
  const {
    throttleMs = 30000, // 30 seconds
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
    enableExpiryCheck = true,
    expiryCheckInterval = 60000, // 1 minute
  } = config;

  const { updateSessionActivity, checkSessionExpiry, isAuthenticated } = useAuthStore();

  const lastActivityRef = useRef<number>(0);
  const expiryCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled activity update function
  const updateActivity = useCallback(() => {
    const now = Date.now();

    // Only update if enough time has passed (throttling)
    if (now - lastActivityRef.current > throttleMs) {
      lastActivityRef.current = now;
      updateSessionActivity();
    }
  }, [updateSessionActivity, throttleMs]);

  // Session expiry check function
  const performExpiryCheck = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await checkSessionExpiry();
    } catch (error) {
      console.error('Error checking session expiry:', error);
    }
  }, [checkSessionExpiry, isAuthenticated]);

  // Setup activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = () => updateActivity();

    // Add event listeners for activity tracking
    events.forEach(event => {
      window.addEventListener(event, handler, { passive: true });
    });

    // Start session expiry checking
    if (enableExpiryCheck) {
      expiryCheckIntervalRef.current = setInterval(performExpiryCheck, expiryCheckInterval);
    }

    // Cleanup function
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handler);
      });

      if (expiryCheckIntervalRef.current) {
        clearInterval(expiryCheckIntervalRef.current);
        expiryCheckIntervalRef.current = null;
      }
    };
  }, [
    isAuthenticated,
    updateActivity,
    performExpiryCheck,
    events,
    enableExpiryCheck,
    expiryCheckInterval,
  ]);

  // Manually trigger activity update (useful for API calls)
  const triggerActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Force session expiry check
  const checkExpiry = useCallback(async () => {
    return await performExpiryCheck();
  }, [performExpiryCheck]);

  return {
    triggerActivity,
    checkExpiry,
    isTracking: isAuthenticated,
  };
};

// Export convenience hook for basic usage
export const useBasicActivityTracker = () => {
  return useActivityTracker();
};
