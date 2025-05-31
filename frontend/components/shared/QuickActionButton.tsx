/**
 * Gyors művelet gomb komponens
 * Quick action button component
 */

import { Button } from '@/components/ui/button';
import {
  QuickAction,
  getActionButtonStyles,
  handleQuickAction,
  trackQuickAction,
} from '@/lib/quick-actions-utils';

interface QuickActionButtonProps {
  action: QuickAction;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function QuickActionButton({
  action,
  onClick,
  disabled = false,
  className = '',
}: QuickActionButtonProps) {
  const Icon = action.icon;

  const handleClick = () => {
    trackQuickAction(action.id);

    if (onClick) {
      onClick();
    } else if (action.href) {
      handleQuickAction(action);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || action.disabled}
      variant={action.isPrimary ? 'default' : 'outline'}
      className={`${getActionButtonStyles(action.isPrimary)} ${className}`}
      title={action.description}
    >
      <Icon className='h-4 w-4 mr-2' />
      {action.label}
    </Button>
  );
}
