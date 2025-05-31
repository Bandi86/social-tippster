/**
 * Felhasználói lista elem komponens
 * User list item component
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarFallback } from '@/lib/ui-utils';

interface UserListItemProps {
  rank?: number;
  username: string;
  avatar?: string;
  points?: number;
  badge?: string;
  subtitle?: string;
  rankColor?: string;
  onClick?: () => void;
  className?: string;
}

export default function UserListItem({
  rank,
  username,
  avatar,
  points,
  badge,
  subtitle,
  rankColor = 'from-blue-500 to-blue-600',
  onClick,
  className = '',
}: UserListItemProps) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer hover:bg-gray-800/50 rounded-lg p-2 -m-2' : ''} ${className}`}
      onClick={handleClick}
    >
      {rank && (
        <div
          className={`w-8 h-8 bg-gradient-to-r ${rankColor} rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
        >
          {rank}
        </div>
      )}

      <Avatar className='h-8 w-8 flex-shrink-0'>
        <AvatarImage src={avatar} alt={username} />
        <AvatarFallback className='bg-amber-600 text-white text-xs'>
          {getAvatarFallback(username)}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium text-white flex items-center gap-1'>
          <span className='truncate'>{username}</span>
          {badge && <span className='text-xs flex-shrink-0'>{badge}</span>}
        </div>
        {subtitle && <div className='text-xs text-gray-400 truncate'>{subtitle}</div>}
      </div>

      {points !== undefined && (
        <div className='text-right flex-shrink-0'>
          <div className='text-sm text-amber-400 font-semibold'>{points.toLocaleString()}</div>
          {points > 0 && <div className='text-xs text-gray-400'>pont</div>}
        </div>
      )}
    </div>
  );
}
