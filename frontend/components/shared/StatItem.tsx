/**
 * Statisztika elem komponens
 * Statistics item component
 */

import { getTrendColor } from '@/lib/community-utils';
import { LucideIcon } from 'lucide-react';

interface StatItemProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string | LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatItem({
  label,
  value,
  change,
  trend,
  icon,
  className = '',
  size = 'md',
}: StatItemProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      value: 'text-lg',
      label: 'text-xs',
      change: 'text-xs',
      icon: 'text-lg',
    },
    md: {
      container: 'p-4',
      value: 'text-xl',
      label: 'text-sm',
      change: 'text-sm',
      icon: 'text-xl',
    },
    lg: {
      container: 'p-6',
      value: 'text-2xl',
      label: 'text-base',
      change: 'text-base',
      icon: 'text-2xl',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={`bg-gray-800/50 rounded-lg border border-gray-700 ${sizes.container} ${className}`}
    >
      <div className='flex items-center justify-between mb-2'>
        <div className={`font-bold text-white ${sizes.value}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {icon && (
          <div className={`${sizes.icon}`}>
            {typeof icon === 'string' ? (
              <span>{icon}</span>
            ) : (
              (() => {
                const IconComponent = icon as LucideIcon;
                return <IconComponent className='h-5 w-5 text-gray-400' />;
              })()
            )}
          </div>
        )}
      </div>

      <div className='flex items-center justify-between'>
        <div className={`text-gray-400 ${sizes.label}`}>{label}</div>
        {change && (
          <div className={`font-medium ${sizes.change} ${getTrendColor(trend)}`}>{change}</div>
        )}
      </div>
    </div>
  );
}
