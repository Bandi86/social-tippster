import { useUsersStore } from '@/store/users';

/**
 * Custom hook for accessing users state and actions
 */
export const useUsers = () => {
  const store = useUsersStore();
  return {
    currentUser: store.currentUser,
    users: store.users,
    userStats: store.userStats,
    currentPage: store.currentPage,
    totalUsers: store.totalUsers,
    hasMore: store.hasMore,
    filters: store.filters,
    isLoading: store.isLoading,
    isSubmitting: store.isSubmitting,
    error: store.error,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    fetchUsers: store.fetchUsers,
    banUser: store.banUser,
    unbanUser: store.unbanUser,
    changeUserRole: store.changeUserRole,
    setFilters: store.setFilters,
    clearError: store.clearError,
  };
};

export default useUsers;
