// filepath: frontend/app/admin/security/components/SessionManager.tsx
// ===============================
// Session Manager Component
// Manage and monitor user sessions
// ===============================

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { securityApi } from '@/lib/security-api';
import { format } from 'date-fns';
import { LogOut, Search, Shield, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface UserSession {
  id: string;
  user_id: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
  session_token: string;
  device_type?: string;
  browser?: string;
  os?: string;
  location?: string;
  country?: string;
  city?: string;
  session_start: string;
  session_end?: string;
  is_active: boolean;
  last_activity?: string;
  activity_count?: number;
}

export interface SessionManagerProps {
  /**
   * View mode for the component
   * @default 'full'
   */
  viewMode?: 'full' | 'summary';

  /**
   * Maximum number of sessions to display
   */
  limit?: number;

  /**
   * Filter by user ID
   */
  userId?: string;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  viewMode = 'full',
  limit,
  userId,
}) => {
  const { toast } = useToast();

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const data = await securityApi.getAllSessions({ userId, limit });
      setSessions(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter sessions based on search and filters
  const filteredSessions = sessions.filter(session => {
    const matchesSearch =
      searchTerm === '' ||
      session.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDevice = deviceFilter === 'all' || session.device_type === deviceFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && session.is_active) ||
      (statusFilter === 'inactive' && !session.is_active);

    return matchesSearch && matchesDevice && matchesStatus;
  });

  // Terminate session
  const terminateSession = useCallback(
    async (sessionId: string) => {
      setTerminatingSession(sessionId);

      try {
        const response = await fetch(`/api/admin/analytics/sessions/${sessionId}/force-logout`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to terminate session: ${response.status}`);
        }

        toast({
          title: 'Session Terminated',
          description: 'The user session has been successfully terminated.',
        });

        // Refresh sessions
        await fetchSessions();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to terminate session';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        console.error('Error terminating session:', err);
      } finally {
        setTerminatingSession(null);
        setShowTerminateDialog(false);
        setSelectedSession(null);
      }
    },
    [toast, fetchSessions],
  );

  // Terminate all sessions for a user
  const terminateAllUserSessions = useCallback(
    async (targetUserId: string) => {
      try {
        const response = await fetch(
          `/api/admin/analytics/sessions/invalidate-all/${targetUserId}`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to terminate user sessions: ${response.status}`);
        }

        const result = await response.json();

        toast({
          title: 'Sessions Terminated',
          description: `${result.terminatedCount} session(s) have been terminated for this user.`,
        });

        // Refresh sessions
        await fetchSessions();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to terminate user sessions';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        console.error('Error terminating user sessions:', err);
      }
    },
    [toast, fetchSessions],
  );

  // Get unique device types for filter
  const deviceTypes = Array.from(new Set(sessions.map(s => s.device_type).filter(Boolean)));

  // Format session duration
  const formatDuration = useCallback((start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }, []);

  if (loading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-48' />
        <div className='space-y-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <div className='text-red-600 mb-2'>⚠️ Error Loading Sessions</div>
        <p className='text-sm text-muted-foreground'>{error}</p>
        <Button onClick={fetchSessions} variant='outline' className='mt-2'>
          Try Again
        </Button>
      </div>
    );
  }

  if (viewMode === 'summary') {
    const activeSessions = sessions.filter(s => s.is_active);
    const deviceCounts = activeSessions.reduce(
      (acc, session) => {
        const device = session.device_type || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4 text-blue-600' />
                <div>
                  <div className='text-2xl font-bold'>{activeSessions.length}</div>
                  <div className='text-sm text-muted-foreground'>Active Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Shield className='h-4 w-4 text-green-600' />
                <div>
                  <div className='text-2xl font-bold'>
                    {new Set(activeSessions.map(s => s.user_id)).size}
                  </div>
                  <div className='text-sm text-muted-foreground'>Unique Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-sm font-medium mb-2'>By Device</div>
              <div className='space-y-1'>
                {Object.entries(deviceCounts).map(([device, count]) => (
                  <div key={device} className='flex justify-between text-sm'>
                    <span className='capitalize'>{device}</span>
                    <Badge variant='outline'>{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <Label htmlFor='search'>Search Sessions</Label>
          <div className='relative'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              id='search'
              placeholder='Search by username, email, or location...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        <div>
          <Label>Device Type</Label>
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Devices</SelectItem>
              {deviceTypes
                .filter(device => device)
                .map(device => (
                  <SelectItem key={device} value={device!}>
                    {device}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions Table */}
      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-20'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                  No sessions found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{session.user.username}</div>
                      <div className='text-sm text-muted-foreground'>{session.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      <div>{session.device_type || 'Unknown'}</div>
                      <div className='text-muted-foreground'>
                        {session.browser || 'Unknown Browser'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      {session.city && session.country
                        ? `${session.city}, ${session.country}`
                        : session.location || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      {format(new Date(session.session_start), 'MMM d, HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      {formatDuration(session.session_start, session.session_end)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.is_active ? 'default' : 'secondary'}>
                      {session.is_active ? 'Active' : 'Ended'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {session.is_active && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setSelectedSession(session);
                          setShowTerminateDialog(true);
                        }}
                        disabled={terminatingSession === session.id}
                      >
                        <LogOut className='h-3 w-3' />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Terminate Session Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this user session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className='space-y-2'>
              <div>
                <strong>User:</strong> {selectedSession.user.username}
              </div>
              <div>
                <strong>Device:</strong> {selectedSession.device_type || 'Unknown'}
              </div>
              <div>
                <strong>Location:</strong> {selectedSession.location || 'Unknown'}
              </div>
              <div>
                <strong>Started:</strong> {format(new Date(selectedSession.session_start), 'PPp')}
              </div>
            </div>
          )}

          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => setShowTerminateDialog(false)}
              disabled={!!terminatingSession}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => selectedSession && terminateSession(selectedSession.id)}
              disabled={!!terminatingSession}
            >
              {terminatingSession ? 'Terminating...' : 'Terminate Session'}
            </Button>
            {selectedSession && (
              <Button
                variant='destructive'
                onClick={() => terminateAllUserSessions(selectedSession.user_id)}
                disabled={!!terminatingSession}
              >
                Terminate All User Sessions
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
