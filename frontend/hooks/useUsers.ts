import { useUsersStore } from '@/store/users';

/**
 * Custom hook for accessing users state and actions
 */
export const useUsers = () => {
  const store = useUsersStore();
  return {
    // Regular user data
    currentUser: store.currentUser,
    users: store.users,
    userStats: store.userStats,
    currentPage: store.currentPage,
    totalUsers: store.totalUsers,
    hasMore: store.hasMore,
    filters: store.filters,

    // Admin user data
    adminUsers: store.adminUsers,
    adminUserStats: store.adminUserStats,
    adminPagination: store.adminPagination,
    adminFilters: store.adminFilters,
    selectedUserIds: store.selectedUserIds,

    // Loading states
    isLoading: store.isLoading,
    isSubmitting: store.isSubmitting,
    error: store.error,
    isLoadingAdminUsers: store.isLoadingAdminUsers,
    isLoadingAdminStats: store.isLoadingAdminStats,

    // Regular user actions
    fetchUserProfile: store.fetchUserProfile,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    fetchUsers: store.fetchUsers,

    // Basic admin actions (existing)
    banUser: store.banUser,
    unbanUser: store.unbanUser,
    changeUserRole: store.changeUserRole,

    // Enhanced admin actions
    fetchAdminUsers: store.fetchAdminUsers,
    fetchAdminUserStats: store.fetchAdminUserStats,
    fetchAdminUserById: store.fetchAdminUserById,
    verifyUserEmail: store.verifyUserEmail,
    revokeUserEmailVerification: store.revokeUserEmailVerification,
    deleteUser: store.deleteUser,
    bulkBanUsers: store.bulkBanUsers,
    bulkUnbanUsers: store.bulkUnbanUsers,
    bulkDeleteUsers: store.bulkDeleteUsers,
    bulkUpdateUserRole: store.bulkUpdateUserRole,

    // Admin UI Management
    setAdminFilters: store.setAdminFilters,
    setAdminPage: store.setAdminPage,
    toggleUserSelection: store.toggleUserSelection,
    selectAllUsers: store.selectAllUsers,
    clearUserSelection: store.clearUserSelection,

    // Regular UI management
    setFilters: store.setFilters,
    clearError: store.clearError,
  };
};

export default useUsers;
