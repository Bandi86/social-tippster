/**
 * Poszt akció gombok komponens
 * Post action buttons component
 */

import { Button } from '@/components/ui/button';
import { getActionButtonStyles, POST_ACTIONS, PostActionType } from '@/lib/post-creation-utils';

interface PostActionButtonsProps {
  selectedAction?: PostActionType;
  onActionSelect: (action: PostActionType) => void;
  disabled?: boolean;
  className?: string;
}

export default function PostActionButtons({
  selectedAction,
  onActionSelect,
  disabled = false,
  className = '',
}: PostActionButtonsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {POST_ACTIONS.map(action => {
        const Icon = action.icon;
        const isSelected = selectedAction === action.id;

        return (
          <Button
            key={action.id}
            onClick={() => onActionSelect(action.id)}
            variant='ghost'
            size='sm'
            disabled={disabled}
            className={getActionButtonStyles(isSelected)}
            title={action.description}
          >
            <Icon className='h-4 w-4 mr-2' />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
