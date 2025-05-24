import { AuthService } from '@/features/auth/auth-service';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Custom hook to check if the user is authenticated
 * and fetch the current user data if they are
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setAuthenticated, setLoading, logout } =
    useAuthStore();

  const { data, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: AuthService.getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
    onError: () => {
      // If there's an error fetching the user, log them out
      logout();
      setLoading(false);
    },
    onSuccess: userData => {
      setUser(userData);
      setAuthenticated(true);
      setLoading(false);
    },
  });

  useEffect(() => {
    // If we already have user data or we're not authenticated, return
    if (user || !isAuthenticated) {
      setLoading(false);
      return;
    }

    // Check if the user has a valid session or refresh token
    const checkAuth = async () => {
      try {
        // Try to refresh the token
        await AuthService.refreshToken();
        // If successful, the query will run to fetch the user data
        setAuthenticated(true);
      } catch (error) {
        // If refreshing fails, the user is not authenticated
        setAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, setAuthenticated, setLoading, setUser, user]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isUserLoading,
    logout,
  };
};
