'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useUsersStore } from '@/store/users';
import { Bell, BellRing, Check, Filter, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const { currentUser } = useUsersStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchNotifications(currentUser.user_id);
    }
  }, [currentUser?.user_id, fetchNotifications]);

  if (!currentUser) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center p-8'>
          <Bell className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Jelentkezz be az értesítések megtekintéséhez
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            Jelentkezz be, hogy lásd a legfrissebb értesítéseket és híreket.
          </p>
          <Link
            href='/auth/login'
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium'
          >
            Bejelentkezés
          </Link>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read_status;
    if (filter === 'read') return notification.read_status;
    return true;
  });

  const notificationTypes = ['all', 'like', 'comment', 'mention', 'follow', 'post', 'match'];

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
    if (diffInMinutes < 60) return `${diffInMinutes} perccel ezelőtt`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} órával ezelőtt`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} nappal ezelőtt`;
    return date.toLocaleDateString('hu-HU');
  };

  const handleMarkAllAsRead = () => {
    if (currentUser?.user_id) {
      markAllAsRead();
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl'>
                {unreadCount > 0 ? (
                  <BellRing className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                ) : (
                  <Bell className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                )}
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Értesítések</h1>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {unreadCount > 0
                    ? `${unreadCount} olvasatlan értesítés`
                    : 'Minden értesítést elolvastál'}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium'
                >
                  <Check className='h-4 w-4' />
                  Mind olvasott
                </button>
              )}
              <Link
                href='/settings/notifications'
                className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'
              >
                <Settings className='h-4 w-4' />
                Beállítások
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Status Filter */}
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-gray-500' />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Állapot:</span>
              <div className='flex gap-1'>
                {[
                  { key: 'all', label: 'Összes' },
                  { key: 'unread', label: 'Olvasatlan' },
                  { key: 'read', label: 'Olvasott' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key as 'all' | 'unread' | 'read')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                      filter === item.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Típus:</span>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className='text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border-none focus:ring-2 focus:ring-blue-500'
              >
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Összes típus' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
          {filteredNotifications.length === 0 ? (
            <div className='text-center py-16'>
              <Bell className='h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                {filter === 'unread' ? 'Nincs olvasatlan értesítés' : 'Nincs értesítés'}
              </h3>
              <p className='text-gray-500 dark:text-gray-400'>
                {filter === 'unread'
                  ? 'Minden értesítést elolvastál. Nagyszerű!'
                  : 'Itt fogod látni a legfrissebb híreket és frissítéseket.'}
              </p>
            </div>
          ) : (
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              {filteredNotifications.map(notification => (
                <div
                  key={notification.notification_id}
                  data-testid='notification-item'
                  onClick={() => markAsRead(notification.notification_id)}
                  className={`p-6 transition-all duration-200 cursor-pointer group ${
                    !notification.read_status
                      ? 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className='flex items-start gap-4'>
                    {/* Icon */}
                    <div className='flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl'>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2'>
                            {notification.title}
                          </h4>
                          <p className='text-gray-600 dark:text-gray-400 mb-3 line-clamp-2'>
                            {notification.content}
                          </p>

                          {/* Action button */}
                          {notification.action_url && (
                            <Link
                              href={notification.action_url}
                              className='inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200 font-medium'
                              onClick={e => e.stopPropagation()}
                            >
                              Megnézem →
                            </Link>
                          )}
                        </div>

                        {/* Status and time */}
                        <div className='flex flex-col items-end gap-2'>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {!notification.read_status && (
                            <div className='w-3 h-3 bg-blue-500 rounded-full animate-pulse'></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {filteredNotifications.length > 0 && (
          <div className='mt-6 text-center'>
            <button className='text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200'>
              Régebbi értesítések betöltése
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
