'use client';

import { SoccerBallIcon } from '@/components/icons/SoccerBallIcon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { useUsersStore } from '@/store/users';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function NotificationsBell() {
  const { currentUser } = useUsersStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const wsRef = useRef<WebSocket | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchNotifications(currentUser.user_id);
      const interval = setInterval(() => fetchNotifications(currentUser.user_id), 30000);

      let ws: WebSocket | null = null;
      try {
        ws = new WebSocket(
          `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/ws/notifications?user_id=${currentUser.user_id}`,
        );
        ws.onmessage = event => {
          try {
            const payload = JSON.parse(
              event.data,
            ) as import('@/types').WebSocketNotificationPayload;
            fetchNotifications(currentUser.user_id);
          } catch {
            fetchNotifications(currentUser.user_id);
          }
        };
        ws.onclose = () => {
          ws = null;
        };
      } catch {}
      return () => {
        clearInterval(interval);
        if (ws) ws.close();
      };
    }
  }, [currentUser?.user_id]);

  if (!currentUser) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className='relative p-2 rounded-full hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-200'
          aria-label='Értesítések'
        >
          <SoccerBallIcon className='h-6 w-6 text-amber-400 animate-spin-slow' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold shadow'>
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-80 p-2 bg-black border border-amber-500/30 shadow-xl rounded-xl animate-in fade-in zoom-in duration-300'
      >
        <div className='flex justify-between items-center mb-2'>
          <span className='font-semibold text-amber-200'>Értesítések</span>
          {unreadCount > 0 && (
            <button
              className='text-xs text-amber-400 hover:underline'
              onClick={() => markAllAsRead(currentUser.user_id)}
            >
              Mind olvasott
            </button>
          )}
        </div>
        <div className='max-h-72 overflow-y-auto space-y-2'>
          {notifications.length === 0 ? (
            <p className='text-sm text-gray-400 text-center py-4'>Nincs értesítés</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.notification_id}
                onClick={() => markAsRead(n.notification_id)}
                className={`rounded-lg p-2 transition-all cursor-pointer hover:bg-amber-500/10 ${
                  !n.read_status ? 'bg-amber-900/20' : ''
                }`}
              >
                <p className='text-sm text-amber-100 font-medium'>{n.title}</p>
                <p className='text-xs text-amber-300'>{n.content}</p>
                {n.action_url && (
                  <Link href={n.action_url} className='text-xs text-blue-400 hover:underline'>
                    Részletek
                  </Link>
                )}
                <p className='text-[10px] text-amber-400 mt-1'>
                  {new Date(n.created_at).toLocaleString('hu-HU')}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
