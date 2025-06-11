'use client';

import { useAuthStore } from '@/store/auth/auth.store';

interface UserProfileProps {
  showEmail?: boolean;
  showRole?: boolean;
  showLastOnline?: boolean;
  className?: string;
}

export default function UserProfile({
  showEmail = true,
  showRole = false,
  showLastOnline = false,
  className = '',
}: UserProfileProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return null;
  }

  const formatLastOnline = (dateString?: string) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      <div className='flex items-center space-x-3'>
        {/* Avatar */}
        <div className='flex-shrink-0'>
          <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
            <span className='text-white font-medium text-sm'>
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center space-x-2'>
            <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
              {user.username}
            </p>
            {user.isOnline && (
              <div className='flex-shrink-0'>
                <div className='w-2 h-2 bg-green-400 rounded-full'></div>
              </div>
            )}
          </div>

          {showEmail && (
            <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{user.email}</p>
          )}

          {showRole && (
            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1'>
              {user.role}
            </span>
          )}

          {showLastOnline && user.lastOnlineAt && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              Last seen {formatLastOnline(user.lastOnlineAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
