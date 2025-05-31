/**
 * Statisztikai sor komponens
 * Statistical row component for displaying key-value pairs
 */

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatRowProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: LucideIcon;
  showIndicator?: boolean;
  indicatorColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export default function StatRow({
  label,
  value,
  color = 'text-gray-400',
  icon: Icon,
  showIndicator = false,
  indicatorColor = 'bg-gray-400',
  trend,
  className,
}: StatRowProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return null;
    }
  };

  const trendIcon = getTrendIcon();

  return (
    <div className={cn('flex justify-between items-center', className)}>
      <span className='flex items-center gap-2 text-gray-300'>
        {showIndicator && <div className={`w-2 h-2 ${indicatorColor} rounded-full`}></div>}
        {Icon && <Icon className='h-4 w-4' />}
        {label}
      </span>
      <span className={cn('font-semibold flex items-center gap-1', color)}>
        {typeof value === 'number' ? value.toLocaleString('hu-HU') : value}
        {trendIcon && <span className='text-xs'>{trendIcon}</span>}
      </span>
    </div>
  );
}
