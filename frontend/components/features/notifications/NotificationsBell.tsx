'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth'; // Change this line
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellRing, Check } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function NotificationsBell() {
  const { user } = useAuth(); // Change this line
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const wsRef = useRef<WebSocket | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Real-time WebSocket connection with better error handling
  useEffect(() => {
    if (user?.id) {
      // Change this line and adjust property name if needed
      fetchNotifications(user.id);

      // Polling backup
      const interval = setInterval(() => fetchNotifications(user.id), 30000);

      // WebSocket for real-time updates
      let ws: WebSocket | null = null;
      const connectWebSocket = () => {
        try {
          ws = new WebSocket(
            `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/ws/notifications?user_id=${user.id}`,
          );

          ws.onopen = () => {
            console.log('Notification WebSocket connected');
          };

          ws.onmessage = event => {
            try {
              const payload = JSON.parse(
                event.data,
              ) as import('@/types').WebSocketNotificationPayload;
              console.log('Received notification:', payload);
              fetchNotifications(user.id);
            } catch (error) {
              console.error('Error parsing notification:', error);
              fetchNotifications(user.id);
            }
          };

          ws.onclose = () => {
            console.log('Notification WebSocket disconnected, attempting to reconnect...');
            ws = null;
            // Attempt to reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
          };

          ws.onerror = error => {
            console.error('WebSocket error:', error);
          };

          wsRef.current = ws;
        } catch (error) {
          console.error('Failed to create WebSocket connection:', error);
        }
      };

      connectWebSocket();

      return () => {
        clearInterval(interval);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [user?.id, fetchNotifications]); // Change this dependency

  // Don't render for non-authenticated users
  if (!user) return null; // Change this line

  const filteredNotifications =
    filter === 'all' ? notifications : notifications.filter(n => !n.read_status);

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'mention':
        return '📢';
      case 'follow':
        return '👤';
      case 'post':
        return '📝';
      case 'match':
        return '⚽';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Most';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className='relative p-2 text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-amber-500/30 focus:outline-none'
          aria-label='Értesítések'
        >
          {unreadCount > 0 ? (
            <BellRing className='h-5 w-5 animate-bounce' />
          ) : (
            <Bell className='h-5 w-5' />
          )}
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg'>
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-96 max-w-[95vw] p-0 border-0 shadow-2xl rounded-2xl bg-white dark:bg-gray-900 overflow-hidden animate-in fade-in zoom-in duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-400/10 to-yellow-500/10 dark:from-amber-900/20 dark:to-yellow-900/10'>
          <div className='flex items-center gap-2'>
            <span className='text-lg font-bold text-gray-900 dark:text-white'>Értesítések</span>
            {unreadCount > 0 && (
              <span className='ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white font-semibold'>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className='flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm'
            >
              <Check className='h-4 w-4' /> Mind olvasott
            </button>
          )}
        </div>
        {/* Filters */}
        <div className='flex items-center gap-2 px-5 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'>
          <button
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors duration-200 ${filter === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            Összes
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors duration-200 ${filter === 'unread' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            onClick={() => setFilter('unread')}
          >
            Olvasatlan
          </button>
        </div>
        {/* Notifications List */}
        <div className='max-h-80 overflow-y-auto bg-white dark:bg-gray-900'>
          {filteredNotifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600'>
              <Bell className='h-12 w-12 mb-2' />
              <span className='text-sm'>Nincs értesítés</span>
            </div>
          ) : (
            filteredNotifications.slice(0, 7).map(notification => (
              <button
                key={notification.notification_id}
                onClick={() => {
                  markAsRead(notification.notification_id);
                  setOpen(false);
                  if (notification.action_url) window.location.href = notification.action_url;
                }}
                className={`w-full flex items-start gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 transition-all duration-150 text-left hover:bg-amber-50 dark:hover:bg-amber-900/10 ${!notification.read_status ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
              >
                <div className='flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-xl'>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold text-gray-900 dark:text-white line-clamp-1'>
                      {notification.title}
                    </span>
                    <span className='text-xs text-gray-400 dark:text-gray-500 ml-2'>
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  <span className='block text-gray-600 dark:text-gray-300 text-sm line-clamp-2'>
                    {notification.content}
                  </span>
                  {!notification.read_status && (
                    <span className='inline-block mt-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        {/* Footer - See all notifications */}
        <div className='px-5 py-3 bg-gradient-to-r from-amber-400/10 to-yellow-500/10 dark:from-amber-900/20 dark:to-yellow-900/10 border-t border-gray-200 dark:border-gray-700 text-center'>
          <Link
            href='/notifications'
            className='inline-block px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors duration-200 shadow-md text-sm'
            onClick={() => setOpen(false)}
          >
            Összes értesítés megtekintése
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
