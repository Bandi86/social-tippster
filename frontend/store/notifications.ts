import axios from '@/lib/axios';
import { create } from 'zustand';

// Helper functions
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

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
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  lastFetch: number | null;
  error: string | null;

  // Actions
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  updateNotification: (notificationId: string, updates: Partial<Notification>) => void;
  clearError: () => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetch: null,
  error: null,

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
    });
  },
}));
