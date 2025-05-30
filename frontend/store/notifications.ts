import api from '@/lib/axios';
import { create } from 'zustand';

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
    const response = await api({ ...config, headers });
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
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  async fetchNotifications(userId) {
    set({ isLoading: true });
    const data = await axiosWithAuth({ url: `/notifications?user_id=${userId}`, method: 'GET' });
    set({
      notifications: data,
      unreadCount: data.filter((n: Notification) => !n.read_status).length,
      isLoading: false,
    });
  },
  async markAsRead(notificationId) {
    await axiosWithAuth({ url: `/notifications/${notificationId}/read`, method: 'PATCH' });
    set(state => ({
      notifications: state.notifications.map(n =>
        n.notification_id === notificationId
          ? { ...n, read_status: true, read_at: new Date().toISOString() }
          : n,
      ),
      unreadCount: state.notifications.filter(
        n => !n.read_status && n.notification_id !== notificationId,
      ).length,
    }));
  },
  async markAllAsRead(userId) {
    await axiosWithAuth({ url: `/notifications/mark-all-read?user_id=${userId}`, method: 'PATCH' });
    set(state => ({
      notifications: state.notifications.map(n => ({
        ...n,
        read_status: true,
        read_at: new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },
}));
