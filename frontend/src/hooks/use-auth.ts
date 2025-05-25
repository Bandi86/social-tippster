import { AuthService } from '@/features/auth/auth-service';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook to check if the user is authenticated
 * and fetch the current user data if they are
 */
export const useAuth = (options: { skipInitialization?: boolean } = {}) => {
  const { user, isAuthenticated, accessToken, setUser, setAuthenticated, setAccessToken, logout } =
    useAuthStore();
  const [isInitialized, setIsInitialized] = useState(options.skipInitialization || false);
  const [isLoading, setIsLoading] = useState(!options.skipInitialization);
  const initializationRef = useRef(false);

  // Memoize the logout function to prevent unnecessary re-renders
  const memoizedLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Only fetch user data if authenticated and we don't have user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: AuthService.getCurrentUser,
    enabled: isAuthenticated && !user && !options.skipInitialization && isInitialized,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set user data when query succeeds
  useEffect(() => {
    if (userData && isAuthenticated) {
      setUser(userData);
    }
  }, [userData, isAuthenticated, setUser]);

  // Initialize auth state on mount - only run once
  useEffect(() => {
    // Skip if already initialized or should skip initialization
    if (initializationRef.current || options.skipInitialization) {
      if (options.skipInitialization) {
        setIsInitialized(true);
        setIsLoading(false);
      }
      return;
    }

    initializationRef.current = true;

    const initializeAuth = async () => {
      setIsLoading(true);

      // If we already have a user, we're authenticated
      if (user) {
        setAuthenticated(true);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // Try to refresh token to check if user is still authenticated
      try {
        const refreshResponse = await AuthService.refreshToken();
        setAccessToken(refreshResponse.accessToken);
        setAuthenticated(true);
      } catch (error) {
        // Refresh failed, user is not authenticated
        setAuthenticated(false);
        memoizedLogout();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once on mount

  // Return loading true only if we're actually loading and not initialized yet
  const finalIsLoading =
    (!isInitialized && isLoading) || (!options.skipInitialization && isUserLoading);

  return {
    user,
    isAuthenticated,
    isLoading: finalIsLoading,
    logout: memoizedLogout,
  };
};
