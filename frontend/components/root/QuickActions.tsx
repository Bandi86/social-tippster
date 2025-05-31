'use client';

import FeaturePreview from '@/components/shared/FeaturePreview';
import QuickActionButton from '@/components/shared/QuickActionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import {
  getAvailableActions,
  getPrimaryActions,
  getSecondaryActions,
  QuickActionType,
} from '@/lib/quick-actions-utils';
import { Zap } from 'lucide-react';

interface QuickActionsProps {
  onCreatePost?: () => void;
  onActionClick?: (actionId: QuickActionType) => void;
  showSecondaryActions?: boolean;
  className?: string;
}

/**
 * Gyors műveletek komponens
 * Bejelentkezett felhasználók számára gyors hozzáférést biztosít a fő funkciókhoz
 *
 * Most már Zustand auth store-t használ és moduláris komponensekre épül
 */
export default function QuickActions({
  onCreatePost,
  onActionClick,
  showSecondaryActions = false,
  className = '',
}: QuickActionsProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 ${className}`}>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg text-white flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            Gyors műveletek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='h-10 bg-gray-700 rounded animate-pulse' />
            <div className='h-10 bg-gray-700 rounded animate-pulse' />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get available actions based on authentication status
  const availableActions = getAvailableActions(isAuthenticated);
  const primaryActions = getPrimaryActions().filter(action => availableActions.includes(action));
  const secondaryActions = getSecondaryActions().filter(action =>
    availableActions.includes(action),
  );

  const handleActionClick = (actionId: QuickActionType) => {
    // Handle special actions
    if (actionId === 'create_post' && onCreatePost) {
      onCreatePost();
      return;
    }

    // Call custom handler if provided
    if (onActionClick) {
      onActionClick(actionId);
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 ${className}`}>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Zap className='h-5 w-5' />
          Gyors műveletek
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-3'>
        {isAuthenticated ? (
          <>
            {/* Primary actions */}
            {primaryActions.map(action => (
              <QuickActionButton
                key={action.id}
                action={action}
                onClick={() => handleActionClick(action.id)}
              />
            ))}

            {/* Secondary actions if enabled */}
            {showSecondaryActions && secondaryActions.length > 0 && (
              <>
                <hr className='border-gray-600' />
                {secondaryActions.map(action => (
                  <QuickActionButton
                    key={action.id}
                    action={action}
                    onClick={() => handleActionClick(action.id)}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <FeaturePreview />
        )}
      </CardContent>
    </Card>
  );
}
