/**
 * Aktivitás elem komponens
 * Individual activity item component
 */

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ActivityItem, formatTimeAgo } from '@/lib/activity-utils';
import { cn } from '@/lib/utils';

interface ActivityItemComponentProps {
  activity: ActivityItem;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export default function ActivityItemComponent({
  activity,
  showIcon = false,
  size = 'md',
  className,
  onClick,
}: ActivityItemComponentProps) {
  const Icon = activity.icon;

  const sizeClasses = {
    sm: {
      avatar: 'h-6 w-6',
      text: 'text-xs',
      time: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      avatar: 'h-8 w-8',
      text: 'text-sm',
      time: 'text-xs',
      gap: 'gap-3',
    },
    lg: {
      avatar: 'h-10 w-10',
      text: 'text-base',
      time: 'text-sm',
      gap: 'gap-4',
    },
  };

  const formatActivityDisplay = () => {
    let text = activity.user.name;
    let actionText = activity.action;
    let targetText = '';

    if (activity.target) {
      switch (activity.target.type) {
        case 'post':
          targetText = ` a "${activity.target.title}" posztra`;
          break;
        case 'user':
          targetText = ` ${activity.target.title}`;
          break;
      }
    }

    return { text, actionText, targetText };
  };

  const { text: userName, actionText, targetText } = formatActivityDisplay();

  return (
    <div
      className={cn(
        `flex items-start ${sizeClasses[size].gap} hover:bg-gray-800/30 rounded-lg p-2 -m-2 transition-colors`,
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className='flex items-center gap-2'>
        <Avatar className={sizeClasses[size].avatar}>
          <AvatarFallback className={`bg-${activity.color} text-white ${sizeClasses[size].text}`}>
            {activity.user.initials}
          </AvatarFallback>
        </Avatar>
        {showIcon && (
          <div className={`text-${activity.color.replace('-600', '-400')} p-1`}>
            <Icon className='h-3 w-3' />
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <div className={cn('text-gray-300', sizeClasses[size].text)}>
          <span className='text-white font-medium'>{userName}</span> {actionText}
          {targetText && <span className='text-amber-400'>{targetText}</span>}
        </div>
        <div className={cn('text-gray-500 mt-1', sizeClasses[size].time)}>
          {formatTimeAgo(activity.timestamp)}
        </div>
      </div>
    </div>
  );
}
