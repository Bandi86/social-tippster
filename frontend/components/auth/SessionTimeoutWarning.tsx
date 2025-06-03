// filepath: frontend/components/auth/SessionTimeoutWarning.tsx
// ===============================
// Session Timeout Warning Component
// Shows warning before session expires and allows extension
// ===============================

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth';
import { useCallback, useEffect, useState } from 'react';

export interface SessionTimeoutWarningProps {
  /**
   * Warning time before session expires (in minutes)
   * @default 5
   */
  warningMinutes?: number;

  /**
   * Auto-logout time after warning (in minutes)
   * @default 1
   */
  autoLogoutMinutes?: number;

  /**
   * Whether to show the warning dialog
   * @default true
   */
  showDialog?: boolean;

  /**
   * Custom callback when session is about to expire
   */
  onSessionExpiring?: () => void;

  /**
   * Custom callback when session is extended
   */
  onSessionExtended?: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  warningMinutes = 5,
  autoLogoutMinutes = 1,
  showDialog = true,
  onSessionExpiring,
  onSessionExtended,
}) => {
  const { sessionExpiry, extendSession, logout, isAuthenticated } = useAuthStore();

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExtending, setIsExtending] = useState(false);
  const [autoLogoutTimer, setAutoLogoutTimer] = useState<NodeJS.Timeout | null>(null);

  // Calculate time until session expiry
  const calculateTimeLeft = useCallback(() => {
    if (!sessionExpiry) return 0;

    const now = Date.now();
    const remaining = sessionExpiry - now;
    return Math.max(0, remaining);
  }, [sessionExpiry]);

  // Format time for display
  const formatTime = useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage for progress bar
  const getProgressPercentage = useCallback(() => {
    if (!timeLeft) return 0;
    const warningMs = warningMinutes * 60 * 1000;
    return Math.max(0, Math.min(100, (timeLeft / warningMs) * 100));
  }, [timeLeft, warningMinutes]);

  // Handle session extension
  const handleExtendSession = useCallback(async () => {
    setIsExtending(true);

    try {
      await extendSession();
      setShowWarning(false);

      // Clear auto-logout timer
      if (autoLogoutTimer) {
        clearTimeout(autoLogoutTimer);
        setAutoLogoutTimer(null);
      }

      onSessionExtended?.();
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  }, [extendSession, autoLogoutTimer, onSessionExtended]);

  // Handle auto-logout
  const handleAutoLogout = useCallback(async () => {
    console.log('Auto-logout triggered due to session timeout');
    await logout();
  }, [logout]);

  // Main effect for session monitoring
  useEffect(() => {
    if (!isAuthenticated || !sessionExpiry) {
      setShowWarning(false);
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      const warningMs = warningMinutes * 60 * 1000;
      const autoLogoutMs = autoLogoutMinutes * 60 * 1000;

      // Show warning when approaching expiry
      if (remaining <= warningMs && remaining > 0 && !showWarning) {
        setShowWarning(true);
        onSessionExpiring?.();

        // Set auto-logout timer
        const logoutTimer = setTimeout(handleAutoLogout, autoLogoutMs * 60 * 1000);
        setAutoLogoutTimer(logoutTimer);
      }

      // Hide warning if session was extended
      if (remaining > warningMs && showWarning) {
        setShowWarning(false);
        if (autoLogoutTimer) {
          clearTimeout(autoLogoutTimer);
          setAutoLogoutTimer(null);
        }
      }

      // Auto-logout if session expired
      if (remaining <= 0 && isAuthenticated) {
        handleAutoLogout();
      }
    }, 1000); // Check every second for accuracy

    return () => {
      clearInterval(interval);
      if (autoLogoutTimer) {
        clearTimeout(autoLogoutTimer);
      }
    };
  }, [
    isAuthenticated,
    sessionExpiry,
    warningMinutes,
    autoLogoutMinutes,
    showWarning,
    autoLogoutTimer,
    calculateTimeLeft,
    onSessionExpiring,
    handleAutoLogout,
  ]);

  // Don't render if not authenticated or no session expiry
  if (!isAuthenticated || !sessionExpiry || !showDialog) {
    return null;
  }

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <span className='text-amber-500'>⚠️</span>
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session will expire soon. Please extend your session to continue working.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Time remaining display */}
          <div className='text-center'>
            <div className='text-2xl font-mono font-bold text-red-600'>{formatTime(timeLeft)}</div>
            <div className='text-sm text-muted-foreground'>Time remaining</div>
          </div>

          {/* Progress bar */}
          <div className='space-y-2'>
            <Progress
              value={getProgressPercentage()}
              className='w-full'
              color={timeLeft < 60000 ? 'red' : timeLeft < 120000 ? 'yellow' : 'green'}
            />
            <div className='text-xs text-muted-foreground text-center'>
              Session expires in {Math.ceil(timeLeft / 60000)} minute(s)
            </div>
          </div>

          {/* Warning message */}
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
            <p className='text-sm text-amber-800'>
              <strong>Important:</strong> You will be automatically logged out in{' '}
              <strong>{autoLogoutMinutes} minute(s)</strong> if no action is taken.
            </p>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={handleAutoLogout} disabled={isExtending}>
            Logout Now
          </Button>
          <Button
            onClick={handleExtendSession}
            disabled={isExtending}
            className='bg-green-600 hover:bg-green-700'
          >
            {isExtending ? 'Extending...' : 'Extend Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Export simplified version for common use cases
export const BasicSessionTimeoutWarning: React.FC = () => {
  return <SessionTimeoutWarning />;
};

export default SessionTimeoutWarning;
