// filepath: frontend/hooks/useLiveSecurityStats.ts
// ===============================
// Live Security Statistics Hook
// Real-time monitoring of security metrics
// ===============================

import { securityApi, type LiveSecurityStatsData } from '@/lib/security-api';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseLiveSecurityStatsOptions {
  /**
   * Auto-refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refreshInterval?: number;

  /**
   * Whether to start fetching immediately
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback for handling errors
   */
  onError?: (error: Error) => void;
}

export interface UseLiveSecurityStatsReturn {
  data: LiveSecurityStatsData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useLiveSecurityStats = (
  options: UseLiveSecurityStatsOptions = {},
): UseLiveSecurityStatsReturn => {
  const {
    refreshInterval = 30000, // 30 seconds
    enabled = true,
    onError,
  } = options;

  const [data, setData] = useState<LiveSecurityStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      if (!data) setIsLoading(true); // Only show loading on first fetch

      const stats = await securityApi.getLiveSecurityStats();

      if (isMountedRef.current) {
        setData(stats);
        setLastUpdated(new Date());
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch security stats';

      if (isMountedRef.current) {
        setError(errorMessage);
        setIsLoading(false);

        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      }

      console.error('Error fetching live security stats:', err);
    }
  }, [data, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(fetchStats, refreshInterval);
  }, [fetchStats, refreshInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchStats();

    // Start polling
    startPolling();

    return () => {
      stopPolling();
    };
  }, [enabled, fetchStats, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling,
  };
};
