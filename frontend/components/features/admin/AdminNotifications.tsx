import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertTriangle, Bell, Check, Eye, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New User Registration',
      message: 'John Doe has registered and needs approval',
      type: 'info',
      isRead: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      icon: UserPlus,
    },
    {
      id: '2',
      title: 'Content Flagged',
      message: 'A post has been flagged for review',
      type: 'warning',
      isRead: false,
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      icon: AlertTriangle,
    },
    {
      id: '3',
      title: 'System Update Complete',
      message: 'Platform maintenance completed successfully',
      type: 'success',
      isRead: true,
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      icon: Check,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='relative text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all'
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs border-0'>
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-80 bg-black/95 backdrop-blur-sm border border-amber-500/20 shadow-xl'
        align='end'
        forceMount
      >
        <DropdownMenuLabel className='flex items-center justify-between p-4'>
          <span className='text-amber-100 font-semibold'>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={markAllAsRead}
              className='text-xs text-amber-400 hover:text-amber-300 h-auto p-1'
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-amber-500/20' />

        {notifications.length === 0 ? (
          <div className='p-4 text-center text-amber-400/60'>No notifications</div>
        ) : (
          <div className='max-h-80 overflow-y-auto'>
            {notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-amber-500/5 border-l-2 ${
                  notification.isRead ? 'border-l-transparent opacity-60' : 'border-l-amber-400'
                }`}
                onSelect={e => e.preventDefault()}
              >
                <div className='flex items-start space-x-3 w-full'>
                  <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                    <notification.icon className='h-4 w-4' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium text-amber-100 truncate'>
                        {notification.title}
                      </p>
                      <div className='flex items-center space-x-1 ml-2'>
                        {!notification.isRead && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => markAsRead(notification.id)}
                            className='h-6 w-6 p-0 text-amber-400 hover:text-amber-300'
                          >
                            <Eye className='h-3 w-3' />
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteNotification(notification.id)}
                          className='h-6 w-6 p-0 text-red-400 hover:text-red-300'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                    <p className='text-xs text-amber-300/80 mt-1'>{notification.message}</p>
                    <p className='text-xs text-amber-400/60 mt-1'>
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminNotifications;
