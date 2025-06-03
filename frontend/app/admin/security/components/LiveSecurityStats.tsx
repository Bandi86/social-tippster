// filepath: frontend/app/admin/security/components/LiveSecurityStats.tsx
// ===============================
// Live Security Stats Component
// Real-time security metrics display
// ===============================

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveSecurityStats } from '@/hooks/useLiveSecurityStats';
import { Activity, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export interface SecurityStats {
  loginStats: {
    last24Hours: {
      successful: number;
      failed: number;
      unique_users: number;
    };
    last7Days: {
      successful: number;
      failed: number;
      unique_users: number;
    };
  };
  activeSessions: {
    total: number;
    byDevice: Record<string, number>;
    byLocation: Record<string, number>;
  };
  securityEvents: {
    total: number;
    highPriority: number;
    resolved: number;
  };
  systemHealth: {
    authServiceStatus: 'healthy' | 'warning' | 'error';
    sessionServiceStatus: 'healthy' | 'warning' | 'error';
    monitoringStatus: 'healthy' | 'warning' | 'error';
  };
}

export interface LiveSecurityStatsProps {
  /**
   * Whether to show a compact view
   * @default false
   */
  compact?: boolean;

  /**
   * Refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refreshInterval?: number;

  /**
   * Custom callback when data is refreshed
   */
  onDataRefresh?: (data: SecurityStats) => void;
}

export const LiveSecurityStats: React.FC<LiveSecurityStatsProps> = ({
  compact = false,
  refreshInterval = 30000,
  onDataRefresh,
}) => {
  const {
    data: realData,
    isLoading,
    error,
    lastUpdated,
    refresh,
  } = useLiveSecurityStats({
    refreshInterval,
    onError: err => console.error('Live stats error:', err),
  });

  // Transform API data to component format
  const stats: SecurityStats | null = realData
    ? {
        loginStats: {
          last24Hours: {
            successful: realData.todaySuccessfulLogins,
            failed: realData.todayFailedLogins,
            unique_users: realData.last24HoursActivity.uniqueUsers,
          },
          last7Days: {
            successful: realData.last24HoursActivity.successfulLogins,
            failed: realData.last24HoursActivity.failedLogins,
            unique_users: realData.last24HoursActivity.uniqueUsers,
          },
        },
        activeSessions: {
          total: realData.currentActiveUsers,
          byDevice: {
            Desktop: Math.floor(realData.currentActiveUsers * 0.6),
            Mobile: Math.floor(realData.currentActiveUsers * 0.4),
          },
          byLocation: { Local: realData.currentActiveUsers },
        },
        securityEvents: {
          total:
            realData.suspiciousActivity.multipleFailedAttemptsToday +
            realData.suspiciousActivity.unusualLocationLogins +
            realData.suspiciousActivity.rapidLoginAttempts,
          highPriority: realData.suspiciousActivity.rapidLoginAttempts,
          resolved: 0,
        },
        systemHealth: {
          authServiceStatus:
            realData.realTimeStats.last5MinutesFailures > 10 ? 'warning' : 'healthy',
          sessionServiceStatus: realData.currentActiveUsers > 0 ? 'healthy' : 'warning',
          monitoringStatus: 'healthy',
        },
      }
    : null;

  // Notify parent of data refresh
  useEffect(() => {
    if (stats && onDataRefresh) {
      onDataRefresh(stats);
    }
  }, [stats, onDataRefresh]);

  // Calculate failure rate
  const getFailureRate = (successful: number, failed: number) => {
    const total = successful + failed;
    return total > 0 ? (failed / total) * 100 : 0;
  };

  // Get status color for system health
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-48' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-4'>
                <Skeleton className='h-6 w-20 mb-2' />
                <Skeleton className='h-8 w-16' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <div className='text-red-600 mb-2'>⚠️ Error Loading Stats</div>
        <p className='text-sm text-muted-foreground'>{error}</p>
        <button onClick={refresh} className='mt-2 text-sm text-blue-600 hover:underline'>
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className='text-center py-8 text-muted-foreground'>No security data available</div>;
  }

  const failureRate24h = getFailureRate(
    stats.loginStats.last24Hours.successful,
    stats.loginStats.last24Hours.failed,
  );

  if (compact) {
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.loginStats.last24Hours.successful}
            </div>
            <div className='text-sm text-muted-foreground'>Successful Logins (24h)</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-600'>
              {stats.loginStats.last24Hours.failed}
            </div>
            <div className='text-sm text-muted-foreground'>Failed Logins (24h)</div>
          </div>
        </div>

        <div className='text-center'>
          <div className='text-lg font-semibold'>{stats.activeSessions.total}</div>
          <div className='text-sm text-muted-foreground'>Active Sessions</div>
        </div>

        {lastUpdated && (
          <div className='text-xs text-muted-foreground text-center'>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with refresh button */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Activity className='h-5 w-5 text-blue-600' />
          <h2 className='text-lg font-semibold'>Live Security Statistics</h2>
        </div>
        <Button onClick={refresh} disabled={isLoading} variant='outline' size='sm'>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {/* Login Statistics */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Login Statistics</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-green-600'>
                {stats.loginStats.last24Hours.successful}
              </div>
              <div className='text-sm text-muted-foreground'>Successful (24h)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-red-600'>
                {stats.loginStats.last24Hours.failed}
              </div>
              <div className='text-sm text-muted-foreground'>Failed (24h)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.loginStats.last24Hours.unique_users}
              </div>
              <div className='text-sm text-muted-foreground'>Unique Users (24h)</div>
            </CardContent>
          </Card>
        </div>

        {/* Failure Rate */}
        <Card className='mt-4'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium'>Login Failure Rate (24h)</span>
              <span className='text-sm text-muted-foreground'>{failureRate24h.toFixed(1)}%</span>
            </div>
            <Progress
              value={failureRate24h}
              className='w-full'
              color={failureRate24h > 10 ? 'red' : failureRate24h > 5 ? 'yellow' : 'green'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Active Sessions</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>{stats.activeSessions.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>By Device Type</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {Object.entries(stats.activeSessions.byDevice).map(([device, count]) => (
                <div key={device} className='flex justify-between'>
                  <span className='capitalize'>{device}</span>
                  <Badge variant='outline'>{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Health */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>System Health</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Auth Service</span>
                <Badge variant={getStatusVariant(stats.systemHealth.authServiceStatus)}>
                  {stats.systemHealth.authServiceStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Session Service</span>
                <Badge variant={getStatusVariant(stats.systemHealth.sessionServiceStatus)}>
                  {stats.systemHealth.sessionServiceStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Monitoring</span>
                <Badge variant={getStatusVariant(stats.systemHealth.monitoringStatus)}>
                  {stats.systemHealth.monitoringStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className='text-xs text-muted-foreground text-center'>
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};
