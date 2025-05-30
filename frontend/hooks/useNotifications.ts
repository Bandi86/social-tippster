import { useNotificationsStore } from '@/store/notifications';
import { useCallback } from 'react';

/**
 * Custom hook for accessing notifications state and actions
 */
export function useNotifications() {
  const notifications = useNotificationsStore(s => s.notifications);
  const unreadCount = useNotificationsStore(s => s.unreadCount);
  const isLoading = useNotificationsStore(s => s.isLoading);
  const fetchNotifications = useNotificationsStore(s => s.fetchNotifications);
  const markAsRead = useNotificationsStore(s => s.markAsRead);
  const markAllAsRead = useNotificationsStore(s => s.markAllAsRead);

  // Opcionális: memoizált wrapper, ha paraméterezni kell
  const fetchForUser = useCallback(
    (userId: string) => fetchNotifications(userId),
    [fetchNotifications],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications: fetchForUser,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotifications;
