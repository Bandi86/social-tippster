import { getAuthToken } from '@/lib/auth-token'; // Centralized token access
import axios from '@/lib/axios';
import { create } from 'zustand';

// Helper functions
async function axiosWithAuth(config: any) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const response = await axios({ ...config, headers });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export interface Notification {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  read_at: string | null;
  read_status: boolean;
  related_post_id?: string;
  related_comment_id?: string;
  related_user_id?: string;
  action_url?: string;
  priority: string;
  snoozed_until?: string | null;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  lastFetch: number | null;
  error: string | null;
  hasMore: boolean;

  // Actions
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  updateNotification: (notificationId: string, updates: Partial<Notification>) => void;
  clearError: () => void;
  reset: () => void;

  // Bulk actions
  bulkMarkAsRead: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;

  // Snooze actions
  snoozeNotification: (notificationId: string, snoozedUntil: string) => Promise<void>;
  bulkSnooze: (ids: string[], snoozedUntil: string) => Promise<void>;

  // Paginated fetch
  fetchNotificationsPaginated: (
    userId: string,
    limit?: number,
    offset?: number,
    includeSnoozed?: boolean,
  ) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetch: null,
  error: null,
  hasMore: true,

  async fetchNotifications(userId) {
    try {
      set({ isLoading: true, error: null });
      const data = await axiosWithAuth({ url: `/notifications`, method: 'GET' });
      set({
        notifications: data,
        unreadCount: data.filter((n: Notification) => !n.read_status).length,
        isLoading: false,
        lastFetch: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({
        isLoading: false,
        error: 'Nem sikerült betölteni az értesítéseket',
      });
    }
  },

  async markAsRead(notificationId) {
    try {
      await axiosWithAuth({ url: `/notifications/${notificationId}/read`, method: 'PATCH' });
      set(state => ({
        notifications: state.notifications.map(n =>
          n.notification_id === notificationId
            ? { ...n, read_status: true, read_at: new Date().toISOString() }
            : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      set({ error: 'Nem sikerült olvasottként megjelölni' });
    }
  },

  async markAllAsRead() {
    try {
      await axiosWithAuth({
        url: `/notifications/mark-all-read`,
        method: 'PATCH',
      });
      set(state => ({
        notifications: state.notifications.map(n => ({
          ...n,
          read_status: true,
          read_at: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      set({ error: 'Nem sikerült az összes értesítést olvasottként megjelölni' });
    }
  },

  async deleteNotification(notificationId) {
    try {
      await axiosWithAuth({ url: `/notifications/${notificationId}`, method: 'DELETE' });
      set(state => {
        const notification = state.notifications.find(n => n.notification_id === notificationId);
        const wasUnread = notification && !notification.read_status;
        return {
          notifications: state.notifications.filter(n => n.notification_id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      set({ error: 'Nem sikerült törölni az értesítést' });
    }
  },

  addNotification(notification) {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: !notification.read_status ? state.unreadCount + 1 : state.unreadCount,
    }));
  },

  updateNotification(notificationId, updates) {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.notification_id === notificationId ? { ...n, ...updates } : n,
      ),
    }));
  },

  clearError() {
    set({ error: null });
  },

  reset() {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      lastFetch: null,
      error: null,
      hasMore: true,
    });
  },

  // Bulk actions
  async bulkMarkAsRead(ids) {
    try {
      await axiosWithAuth({ url: '/notifications/bulk/mark-read', method: 'PATCH', data: { ids } });
      set(state => ({
        notifications: state.notifications.map(n =>
          ids.includes(n.notification_id) ? { ...n, read_status: true } : n,
        ),
        unreadCount: state.notifications.filter(
          n => !ids.includes(n.notification_id) && !n.read_status,
        ).length,
      }));
    } catch (error) {
      set({ error: 'Nem sikerült olvasottra állítani az értesítéseket' });
    }
  },
  async bulkDelete(ids) {
    try {
      await axiosWithAuth({ url: '/notifications/bulk/delete', method: 'DELETE', data: { ids } });
      set(state => ({
        notifications: state.notifications.filter(n => !ids.includes(n.notification_id)),
        unreadCount: state.notifications.filter(
          n => !ids.includes(n.notification_id) && !n.read_status,
        ).length,
      }));
    } catch (error) {
      set({ error: 'Nem sikerült törölni az értesítéseket' });
    }
  },

  // Snooze a single notification
  async snoozeNotification(notificationId: string, snoozedUntil: string) {
    try {
      const updated = await axiosWithAuth({
        url: `/notifications/${notificationId}/snooze`,
        method: 'PATCH',
        data: { snoozed_until: snoozedUntil },
      });
      set(state => ({
        notifications: state.notifications.map(n =>
          n.notification_id === notificationId ? { ...n, snoozed_until: snoozedUntil } : n,
        ),
      }));
      return updated;
    } catch (error) {
      set({ error: 'Nem sikerült szundizni az értesítést' });
    }
  },

  // Bulk snooze notifications
  async bulkSnooze(ids: string[], snoozedUntil: string) {
    try {
      await axiosWithAuth({
        url: '/notifications/bulk/snooze',
        method: 'PATCH',
        data: { ids, snoozed_until: snoozedUntil },
      });
      set(state => ({
        notifications: state.notifications.map(n =>
          ids.includes(n.notification_id) ? { ...n, snoozed_until: snoozedUntil } : n,
        ),
      }));
    } catch (error) {
      set({ error: 'Nem sikerült szundizni az értesítéseket' });
    }
  },

  // Paginated fetch
  async fetchNotificationsPaginated(
    userId: string,
    limit = 20,
    offset = 0,
    includeSnoozed = false,
  ) {
    try {
      set({ isLoading: true, error: null });
      const data = await axiosWithAuth({
        url: `/notifications/paginated`,
        method: 'GET',
        params: { limit, offset, includeSnoozed },
      });
      set(state => ({
        notifications:
          offset === 0 ? data.notifications : [...state.notifications, ...data.notifications],
        unreadCount: (offset === 0
          ? data.notifications
          : [...state.notifications, ...data.notifications]
        ).filter((n: Notification) => !n.read_status).length,
        isLoading: false,
        lastFetch: Date.now(),
        hasMore: data.hasMore,
      }));
    } catch (error) {
      set({ isLoading: false, error: 'Nem sikerült betölteni az értesítéseket' });
    }
  },
}));
