/**
 * Magyar: Közös hook-ok a felhasználói komponensekhez
 * Shared hooks for user components to reduce code duplication
 */

import { toast } from '@/hooks/use-toast';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Magyar: Debounced érték hook
 * Hook for debounced values to optimize search functionality
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Magyar: Optimalizált infinite scroll hook
 * Hook for infinite scrolling with intersection observer
 */
export function useInfiniteScroll(hasMore: boolean, isLoading: boolean, onLoadMore: () => void) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return observerTarget;
}

/**
 * Magyar: Optimalizált async műveletek hook
 * Hook for handling async operations with error handling
 */
export function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAsync = useCallback(
    async (
      operation: () => Promise<any>,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
      },
    ) => {
      const {
        successMessage = 'Művelet sikeres',
        errorMessage = 'Hiba történt',
        showSuccessToast = false,
        showErrorToast = true,
      } = options || {};

      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();

        if (showSuccessToast) {
          toast({
            title: 'Sikeres művelet',
            description: successMessage,
            variant: 'default',
          });
        }

        return result;
      } catch (err: any) {
        const errorMsg = err?.message || errorMessage;
        setError(errorMsg);

        if (showErrorToast) {
          toast({
            title: 'Hiba történt',
            description: errorMsg,
            variant: 'destructive',
          });
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    error,
    executeAsync,
    clearError: () => setError(null),
  };
}

/**
 * Magyar: Pagination hook újrafelhasználhatósággal
 * Reusable pagination hook
 */
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  const updateHasMore = useCallback(
    (itemsCount: number) => {
      setHasMore(itemsCount >= limit);
    },
    [limit],
  );

  return {
    page,
    limit,
    hasMore,
    setPage,
    setLimit,
    setHasMore,
    nextPage,
    resetPagination,
    updateHasMore,
  };
}

/**
 * Magyar: Local storage sync hook
 * Hook for syncing state with localStorage
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, value],
  );

  return [value, setStoredValue] as const;
}
