'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useUsersStore } from '@/store/users';
import { Bell, BellRing, Check, Clock, Filter, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function NotificationsPage() {
  const { currentUser } = useUsersStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    bulkSnooze,
    fetchNotificationsPaginated,
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [snoozeTarget, setSnoozeTarget] = useState<string | null>(null);
  const [snoozeDuration, setSnoozeDuration] = useState<string>('1h');
  const [hasMore, setHasMore] = useState(true);
  const [paginationOffset, setPaginationOffset] = useState(0);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const { bulkMarkAsRead, bulkDelete } = useNotifications();
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchNotifications(currentUser.user_id);
      fetchNotificationsPaginated(currentUser.user_id, PAGE_SIZE, 0, false);
      setPaginationOffset(PAGE_SIZE);
      setHasMore(true);
    }
  }, [currentUser?.user_id, fetchNotifications, fetchNotificationsPaginated]);

  const handleLoadOlder = async () => {
    if (currentUser?.user_id && hasMore) {
      await fetchNotificationsPaginated(currentUser.user_id, PAGE_SIZE, paginationOffset, false);
      setPaginationOffset(paginationOffset + PAGE_SIZE);
      // Zustand store should update hasMore
    }
  };

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

  const handleSelect = (id: string) => {
    setSelectedIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));
  };
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.notification_id));
    }
  };
  const handleBulkMarkAsRead = () => {
    bulkMarkAsRead(selectedIds);
    setSelectedIds([]);
  };
  const handleBulkDelete = () => {
    bulkDelete(selectedIds);
    setSelectedIds([]);
  };
  const handleSnooze = (id: string) => {
    setSnoozeTarget(id);
    setShowSnoozeModal(true);
  };
  const handleBulkSnooze = () => {
    setSnoozeTarget('bulk');
    setShowSnoozeModal(true);
  };
  const confirmSnooze = async () => {
    const until = new Date(Date.now() + parseSnoozeDuration(snoozeDuration)).toISOString();
    if (snoozeTarget === 'bulk') {
      await bulkSnooze(selectedIds, until);
      setSelectedIds([]);
    } else if (snoozeTarget) {
      await snoozeNotification(snoozeTarget, until);
    }
    setShowSnoozeModal(false);
    setSnoozeTarget(null);
  };
  function parseSnoozeDuration(duration: string) {
    if (duration.endsWith('h')) return parseInt(duration) * 60 * 60 * 1000;
    if (duration.endsWith('d')) return parseInt(duration) * 24 * 60 * 60 * 1000;
    return 60 * 60 * 1000; // default 1h
  }

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
            href='/auth'
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium'
          >
            Bejelentkezés
          </Link>
        </div>
      </div>
    );
  }

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
            <>
              <div className='flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700'>
                <input
                  type='checkbox'
                  ref={selectAllRef}
                  checked={
                    selectedIds.length === filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={handleSelectAll}
                  className='accent-blue-600 h-4 w-4 rounded'
                  aria-label='Összes kijelölése'
                />
                <span className='text-sm text-gray-700 dark:text-gray-300'>Összes kijelölése</span>
                <button
                  onClick={handleBulkMarkAsRead}
                  disabled={selectedIds.length === 0}
                  className='ml-2 px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 text-xs'
                >
                  Kijelöltek olvasottra
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className='ml-2 px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50 text-xs'
                >
                  Kijelöltek törlése
                </button>
                <button
                  onClick={handleBulkSnooze}
                  disabled={selectedIds.length === 0}
                  className='ml-2 px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50 text-xs flex items-center gap-1'
                >
                  <Clock className='h-4 w-4' /> Kijelöltek szundizása
                </button>
              </div>
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
                      <input
                        type='checkbox'
                        checked={selectedIds.includes(notification.notification_id)}
                        onChange={e => {
                          e.stopPropagation();
                          handleSelect(notification.notification_id);
                        }}
                        className='accent-blue-600 h-4 w-4 rounded mt-2'
                        aria-label='Értesítés kijelölése'
                      />
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
                            {/* Snooze button */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleSnooze(notification.notification_id);
                              }}
                              className='mt-2 px-2 py-1 bg-yellow-500 text-white rounded text-xs flex items-center gap-1 hover:bg-yellow-600'
                              title='Szundizás'
                            >
                              <Clock className='h-4 w-4' />
                              Szundi
                            </button>
                            {/* Snoozed indicator */}
                            {notification.snoozed_until &&
                              new Date(notification.snoozed_until) > new Date() && (
                                <span className='text-xs text-yellow-600 dark:text-yellow-400'>
                                  Szundizva:{' '}
                                  {new Date(notification.snoozed_until).toLocaleString('hu-HU')}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Load Older Button */}
        {hasMore && (
          <div className='mt-4 text-center'>
            <button
              onClick={handleLoadOlder}
              className='inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm'
            >
              Régebbi értesítések betöltése
            </button>
          </div>
        )}

        {/* Snooze Modal */}
        {showSnoozeModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col gap-4'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2'>
                Szundizás időtartama
              </h3>
              <select
                value={snoozeDuration}
                onChange={e => setSnoozeDuration(e.target.value)}
                className='px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
              >
                <option value='1h'>1 óra</option>
                <option value='4h'>4 óra</option>
                <option value='12h'>12 óra</option>
                <option value='1d'>1 nap</option>
                <option value='7d'>1 hét</option>
              </select>
              <div className='flex gap-2 mt-4'>
                <button
                  onClick={confirmSnooze}
                  className='flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors font-medium'
                >
                  Szundizás
                </button>
                <button
                  onClick={() => setShowSnoozeModal(false)}
                  className='flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium'
                >
                  Mégse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
