/**
 * Statisztikai elem komponens
 * Individual statistic item component with trend indicators
 */

import { StatItem, getTrendColor, getTrendIcon } from '@/lib/stats-utils';
import { cn } from '@/lib/utils';

interface StatItemComponentProps {
  stat: StatItem;
  showTrend?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatItemComponent({
  stat,
  showTrend = false,
  size = 'md',
  className,
}: StatItemComponentProps) {
  const TrendIcon = stat.trend ? getTrendIcon(stat.trend) : null;
  const trendColor = stat.trend ? getTrendColor(stat.trend) : '';

  const sizeClasses = {
    sm: {
      container: 'p-2',
      value: 'text-lg',
      label: 'text-xs',
    },
    md: {
      container: 'p-3',
      value: 'text-2xl',
      label: 'text-xs',
    },
    lg: {
      container: 'p-4',
      value: 'text-3xl',
      label: 'text-sm',
    },
  };

  return (
    <div
      className={cn(
        `bg-gradient-to-br from-${stat.color.from} to-${stat.color.to} rounded-lg`,
        sizeClasses[size].container,
        className,
      )}
    >
      <div className='flex items-center justify-between mb-1'>
        <div className={cn(`text-${stat.color.text} font-bold`, sizeClasses[size].value)}>
          {stat.value}
        </div>
        {showTrend && TrendIcon && stat.trendValue && (
          <div className={cn('flex items-center', trendColor)}>
            <TrendIcon className='h-3 w-3 mr-1' />
            <span className='text-xs'>{Math.abs(stat.trendValue)}%</span>
          </div>
        )}
      </div>
      <div className={cn('text-gray-400', sizeClasses[size].label)}>{stat.label}</div>
    </div>
  );
}
