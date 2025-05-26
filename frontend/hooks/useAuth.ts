import { useAuthStore } from '@/store/auth';

/**
 * Custom hook for accessing authentication state and actions
 * Provides convenient access to auth store functionality
 */
export const useAuth = () => {
  const store = useAuthStore();

  return {
    // State
    user: store.user,
    tokens: store.tokens,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,
    lastActivity: store.lastActivity,
    sessionExpiry: store.sessionExpiry,

    // Derived state
    isAdmin: store.user?.role === 'admin',
    isModerator: store.user?.role === 'moderator',
    hasAdminAccess: store.user?.role === 'admin' || store.user?.role === 'moderator',

    // Actions
    login: store.login,
    logout: store.logout,
    register: store.register,
    refresh: store.refresh,
    resetPassword: store.resetPassword,
    changePassword: store.changePassword,
    verifyEmail: store.verifyEmail,
    resendVerification: store.resendVerification,

    // State management
    setUser: store.setUser,
    setAccessToken: store.setAccessToken,
    setLoading: store.setLoading,
    setError: store.setError,
    clearAuth: store.clearAuth,
    clearError: store.clearError,

    // Utility
    initialize: store.initialize,
    checkAuthStatus: store.checkAuthStatus,
    refreshUserData: store.refreshUserData,
    updateLastActivity: store.updateLastActivity,
  };
};

export default useAuth;
