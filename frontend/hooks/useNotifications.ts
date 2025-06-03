import { useNotificationsStore } from '@/store/notifications';
import { useCallback } from 'react';

/**
 * Custom hook for accessing notifications state and actions
 */
export function useNotifications() {
  const notifications = useNotificationsStore(s => s.notifications);
  const unreadCount = useNotificationsStore(s => s.unreadCount);
  const isLoading = useNotificationsStore(s => s.isLoading);
  const hasMore = useNotificationsStore(s => s.hasMore);
  const error = useNotificationsStore(s => s.error);
  const fetchNotifications = useNotificationsStore(s => s.fetchNotifications);
  const markAsRead = useNotificationsStore(s => s.markAsRead);
  const markAllAsRead = useNotificationsStore(s => s.markAllAsRead);
  const bulkMarkAsRead = useNotificationsStore(s => s.bulkMarkAsRead);
  const bulkDelete = useNotificationsStore(s => s.bulkDelete);
  const snoozeNotification = useNotificationsStore(s => s.snoozeNotification);
  const bulkSnooze = useNotificationsStore(s => s.bulkSnooze);
  const fetchNotificationsPaginated = useNotificationsStore(s => s.fetchNotificationsPaginated);
  const clearError = useNotificationsStore(s => s.clearError);

  // Opcionális: memoizált wrapper, ha paraméterezni kell
  const fetchForUser = useCallback(
    (userId: string) => fetchNotifications(userId),
    [fetchNotifications],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    error,
    fetchNotifications: fetchForUser,
    markAsRead,
    markAllAsRead,
    bulkMarkAsRead,
    bulkDelete,
    snoozeNotification,
    bulkSnooze,
    fetchNotificationsPaginated,
    clearError,
  };
}

export default useNotifications;
