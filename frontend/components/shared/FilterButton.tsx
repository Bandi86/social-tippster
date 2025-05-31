/**
 * Szűrő gomb komponens
 * Filter button component
 */

import { Button } from '@/components/ui/button';
import { FeedFilter, getFilterButtonStyles } from '@/lib/feed-filters-utils';

interface FilterButtonProps {
  filter: FeedFilter;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function FilterButton({
  filter,
  isSelected,
  onClick,
  disabled = false,
  showIcon = false,
  size = 'sm',
  className = '',
}: FilterButtonProps) {
  const Icon = filter.icon;

  return (
    <Button
      variant={isSelected ? 'default' : 'ghost'}
      size={size}
      onClick={onClick}
      disabled={disabled}
      title={filter.description}
      className={`${getFilterButtonStyles(isSelected, filter.color)} ${className}`}
    >
      {showIcon && <Icon className='h-4 w-4 mr-2' />}
      {filter.label}
    </Button>
  );
}
