import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { useUsersStore } from '@/store/users';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export function NotificationsBell() {
  const { currentUser } = useUsersStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchNotifications(currentUser.user_id);
      // Polling: 30 másodpercenként frissít
      const interval = setInterval(() => fetchNotifications(currentUser.user_id), 30000);
      // WebSocket real-time frissítés
      let ws: WebSocket | null = null;
      try {
        ws = new WebSocket(
          `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://` +
            window.location.hostname +
            (window.location.port ? `:${window.location.port}` : '') +
            `/ws/notifications?user_id=${currentUser.user_id}`,
        );
        ws.onmessage = event => {
          try {
            const payload = JSON.parse(
              event.data,
            ) as import('@/types').WebSocketNotificationPayload;
            if (payload.type === 'new_notification' && payload.notification) {
              // Optionally: addNotification(payload.notification) if store supports it
              fetchNotifications(currentUser.user_id);
            } else if (payload.type === 'notification_read') {
              fetchNotifications(currentUser.user_id);
            } else {
              // fallback: always refetch for unknown types
              fetchNotifications(currentUser.user_id);
            }
          } catch {
            // fallback: always refetch
            fetchNotifications(currentUser.user_id);
          }
        };
        ws.onclose = () => {
          ws = null;
        };
      } catch (e) {
        // fallback: csak polling
      }
      return () => {
        clearInterval(interval);
        if (ws) ws.close();
      };
    }
  }, [currentUser?.user_id]);

  if (!currentUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'>
          <Bell className='h-6 w-6' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1'>
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80 max-h-96 overflow-y-auto'>
        <div className='flex justify-between items-center px-2 py-1'>
          <span className='font-semibold'>Értesítések</span>
          {unreadCount > 0 && (
            <button
              className='text-xs text-blue-600 hover:underline'
              onClick={() => markAllAsRead(currentUser.user_id)}
            >
              Mind olvasott
            </button>
          )}
        </div>
        {notifications.length === 0 && (
          <div className='px-2 py-4 text-center text-gray-500'>Nincs értesítés</div>
        )}
        {notifications.map(n => (
          <DropdownMenuItem
            key={n.notification_id}
            className={`flex flex-col items-start gap-1 ${!n.read_status ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
            onClick={() => markAsRead(n.notification_id)}
          >
            <span className='font-medium'>{n.title}</span>
            <span className='text-xs text-gray-500'>{n.content}</span>
            {n.action_url && (
              <Link href={n.action_url} className='text-xs text-blue-600 hover:underline'>
                Részletek
              </Link>
            )}
            <span className='text-[10px] text-gray-400 mt-1'>
              {new Date(n.created_at).toLocaleString('hu-HU')}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
