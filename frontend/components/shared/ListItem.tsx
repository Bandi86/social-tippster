/**
 * Lista elem komponens általános használatra
 * Generic list item component
 */

import { Badge } from '@/components/ui/badge';
import { getTrendDirectionColor } from '@/lib/trending-utils';

interface ListItemProps {
  rank?: number;
  title: string;
  subtitle?: string;
  value?: string | number;
  trend?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeClassName?: string;
  onClick?: () => void;
  className?: string;
}

export default function ListItem({
  rank,
  title,
  subtitle,
  value,
  trend,
  badge,
  badgeVariant = 'secondary',
  badgeClassName = '',
  onClick,
  className = '',
}: ListItemProps) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`flex items-center justify-between ${onClick ? 'cursor-pointer hover:bg-gray-800/50 rounded-lg p-2 -m-2' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className='flex items-center gap-2'>
        {rank && <span className='text-xs font-bold text-gray-500 w-6'>#{rank}</span>}

        {badge && (
          <Badge variant={badgeVariant} className={`${badgeClassName}`}>
            {badge}
          </Badge>
        )}

        {!badge && (
          <div>
            <div className='text-sm font-medium text-white'>{title}</div>
            {subtitle && <div className='text-xs text-gray-400'>{subtitle}</div>}
          </div>
        )}
      </div>

      {(value !== undefined || trend) && (
        <div className='text-right'>
          {value !== undefined && (
            <div className='text-sm text-amber-400 font-semibold'>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          )}
          {trend && (
            <div className={`text-xs font-medium ${getTrendDirectionColor(trend)}`}>{trend}</div>
          )}
        </div>
      )}
    </div>
  );
}
