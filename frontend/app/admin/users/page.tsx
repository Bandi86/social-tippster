'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsers } from '@/hooks/useUsers';
import { AdminUser } from '@/store/users';
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Eye,
  MoreHorizontal,
  Search,
  Shield,
  Trash,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AdminStats {
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
}

const AdminUsersPage = () => {
  const {
    // Admin data
    adminUsers: users,
    adminUserStats: stats,

    // Admin pagination and filters
    adminPagination,
    adminFilters,

    // Admin UI state
    isLoadingAdminUsers: loading,

    // Admin actions
    fetchAdminUsers,
    fetchAdminUserStats,
    banUser,
    unbanUser,
    deleteUser,
    changeUserRole,
    verifyUserEmail,
    revokeUserEmailVerification,
    setAdminPage,
    setAdminFilters,
  } = useUsers();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });

  // Use a ref for AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  const usersPerPage = 10;

  // Extract values from pagination object
  const currentPage = adminPagination.page;
  const totalUsers = adminPagination.total;
  const totalPages = adminPagination.totalPages;

  // Extract values from filters object
  const searchTerm = adminFilters.search;
  const roleFilter = adminFilters.role;
  // Map banned boolean to status filter value
  const statusFilter =
    adminFilters.banned === true ? 'banned' : adminFilters.banned === false ? 'active' : 'all';

  const loadUsers = async (signal?: AbortSignal) => {
    try {
      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        banned: adminFilters.banned,
      };

      await fetchAdminUsers(params);
    } catch (error) {
      // Don't show error if request was cancelled
      if (!signal?.aborted) {
        console.error('Failed to load users:', error);
        toast.error('Failed to load users');
      }
    }
  };

  const loadStats = async (signal?: AbortSignal) => {
    try {
      await fetchAdminUserStats();
    } catch (error) {
      // Don't show error if request was cancelled
      if (!signal?.aborted) {
        console.error('Failed to load stats:', error);
        toast.error('Failed to load statistics');
      }
    }
  };

  // Load initial data and stats
  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const initializeData = async () => {
      try {
        // Load both stats and initial users data
        await Promise.all([loadStats(abortController.signal), loadUsers(abortController.signal)]);
      } catch (error) {
        if (!abortController.signal.aborted) {
          // Error occurred during initialization
        }
      }
    };

    initializeData();

    return () => {
      abortController.abort();
      abortControllerRef.current = null;
    };
  }, []);

  // Load users when filters or pagination change (but not on initial load)
  useEffect(() => {
    // Skip if this is the initial load (users are already loaded above)
    if (currentPage === 1 && !searchTerm && roleFilter === 'all' && statusFilter === 'all') {
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    loadUsers(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const handleUserAction = async (action: string, userId: string, newRole?: string) => {
    try {
      setActionLoading(userId);

      switch (action) {
        case 'ban':
          await banUser(userId, 'Banned by admin');
          toast.success('User banned successfully');
          break;
        case 'unban':
          await unbanUser(userId);
          toast.success('User unbanned successfully');
          break;
        case 'verify':
          await verifyUserEmail(userId);
          toast.success('User email verified successfully');
          break;
        case 'unverify':
          await revokeUserEmailVerification(userId);
          toast.success('User email verification revoked');
          break;
        case 'role':
          if (newRole) {
            await changeUserRole(userId, newRole);
            toast.success(`User role updated to ${newRole}`);
          }
          break;
      }

      await loadUsers();
      await loadStats();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;

    try {
      setActionLoading(deleteDialog.user.id);
      await deleteUser(deleteDialog.user.id);
      toast.success('User deleted successfully');
      await loadUsers();
      await loadStats();
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black';
      case 'moderator':
        return 'border-blue-500/50 text-blue-400';
      default:
        return 'border-amber-500/50 text-amber-300';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-amber-500 mb-2'>User Management</h1>
          <p className='text-gray-400'>Manage system users and their permissions</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Users className='h-6 w-6 text-amber-500' />
          <span className='text-white font-medium'>{totalUsers} Total Users</span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4' data-testid='admin-stats'>
          <Card className='bg-gray-900 border-amber-500/20'>
            <CardContent className='p-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-amber-500 mb-2'>{stats.total}</div>
                <div className='text-sm text-gray-400'>Total Users</div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-gray-900 border-green-500/20'>
            <CardContent className='p-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-500 mb-2'>{stats.active}</div>
                <div className='text-sm text-gray-400'>Active Users</div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-gray-900 border-red-500/20'>
            <CardContent className='p-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-red-500 mb-2'>{stats.banned}</div>
                <div className='text-sm text-gray-400'>Banned Users</div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-gray-900 border-blue-500/20'>
            <CardContent className='p-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-blue-500 mb-2'>{stats.admins || 0}</div>
                <div className='text-sm text-gray-400'>Admins</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className='bg-gray-900 border-amber-500/20'>
        <CardHeader>
          <CardTitle className='text-amber-500'>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search users...'
                  value={searchTerm}
                  onChange={e => setAdminFilters({ search: e.target.value })}
                  className='pl-9 bg-gray-800 border-gray-700 text-white'
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={value => setAdminFilters({ role: value })}>
              <SelectTrigger className='w-full md:w-[180px] bg-gray-800 border-gray-700 text-white'>
                <SelectValue placeholder='Filter by role' />
              </SelectTrigger>
              <SelectContent className='bg-gray-800 border-gray-700'>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='moderator'>Moderator</SelectItem>
                <SelectItem value='user'>User</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={value => {
                // Map frontend status values to backend format
                if (value === 'active') {
                  setAdminFilters({ banned: false });
                } else if (value === 'banned') {
                  setAdminFilters({ banned: true });
                } else {
                  // For 'all', remove the banned filter
                  const { banned, ...restFilters } = adminFilters;
                  setAdminFilters(restFilters);
                }
              }}
            >
              <SelectTrigger className='w-full md:w-[180px] bg-gray-800 border-gray-700 text-white'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent className='bg-gray-800 border-gray-700'>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='banned'>Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className='bg-gray-900 border-amber-500/20'>
        <CardHeader>
          <CardTitle className='text-amber-500'>Users ({totalUsers})</CardTitle>
          <CardDescription className='text-gray-400'>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-8'>
              <div className='text-gray-400'>Loading users...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='border-gray-700 hover:bg-gray-800/50'>
                    <TableHead className='text-amber-300'>User</TableHead>
                    <TableHead className='text-amber-300'>Role</TableHead>
                    <TableHead className='text-amber-300'>Status</TableHead>
                    <TableHead className='text-amber-300'>Email</TableHead>
                    <TableHead className='text-amber-300'>Joined</TableHead>
                    <TableHead className='text-amber-300'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map(user => (
                    <TableRow key={user.id} className='border-gray-700 hover:bg-gray-800/50'>
                      <TableCell>
                        <div className='flex items-center space-x-3'>
                          <div className='h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center'>
                            <span className='text-black font-semibold text-sm'>
                              {user.username[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className='font-medium text-white'>{user.username}</div>
                            <div className='text-sm text-gray-400'>ID: {user.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user?.role === 'admin' ? 'default' : 'outline'}
                          className={getRoleBadgeColor(user.role)}
                        >
                          {user.role === 'admin' && <Shield className='h-3 w-3 mr-1' />}
                          {user.role === 'moderator' && <UserCheck className='h-3 w-3 mr-1' />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          {user.is_active ? (
                            <Badge className='bg-green-500/20 text-green-400 border-green-500/50'>
                              Active
                            </Badge>
                          ) : (
                            <Badge className='bg-red-500/20 text-red-400 border-red-500/50'>
                              <AlertTriangle className='h-3 w-3 mr-1' />
                              Inactive
                            </Badge>
                          )}
                          {user.is_banned && (
                            <Badge className='bg-red-500/20 text-red-400 border-red-500/50'>
                              Banned
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-white'>{user.email}</div>
                        {user.is_verified && (
                          <div className='text-xs text-green-400 flex items-center mt-1'>
                            <CheckCircle className='h-3 w-3 mr-1' />
                            Verified
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='text-gray-400'>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              disabled={actionLoading === user.id}
                              className='h-8 w-8 p-0'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className='bg-gray-800 border-gray-700'>
                            <DropdownMenuItem
                              onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
                              className='text-white hover:bg-gray-700'
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className='bg-gray-700' />

                            {user.is_banned ? (
                              <DropdownMenuItem
                                onClick={() => handleUserAction('unban', user.id)}
                                className='text-green-400 hover:bg-gray-700'
                              >
                                <CheckCircle className='mr-2 h-4 w-4' />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUserAction('ban', user.id)}
                                className='text-red-400 hover:bg-gray-700'
                              >
                                <Ban className='mr-2 h-4 w-4' />
                                Ban User
                              </DropdownMenuItem>
                            )}

                            {user.is_verified ? (
                              <DropdownMenuItem
                                onClick={() => handleUserAction('unverify', user.id)}
                                className='text-orange-400 hover:bg-gray-700'
                              >
                                <XCircle className='mr-2 h-4 w-4' />
                                Unverify Email
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUserAction('verify', user.id)}
                                className='text-green-400 hover:bg-gray-700'
                              >
                                <CheckCircle className='mr-2 h-4 w-4' />
                                Verify Email
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className='bg-gray-700' />

                            {user.role !== 'admin' && (
                              <DropdownMenuItem
                                onClick={() => handleUserAction('role', user.id, 'admin')}
                                className='text-amber-400 hover:bg-gray-700'
                              >
                                <Shield className='mr-2 h-4 w-4' />
                                Make Admin
                              </DropdownMenuItem>
                            )}

                            {user.role === 'admin' && (
                              <DropdownMenuItem
                                onClick={() => handleUserAction('role', user.id, 'user')}
                                className='text-blue-400 hover:bg-gray-700'
                              >
                                <UserCheck className='mr-2 h-4 w-4' />
                                Remove Admin
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className='bg-gray-700' />

                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, user })}
                              className='text-red-400 hover:bg-gray-700'
                            >
                              <Trash className='mr-2 h-4 w-4' />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between mt-4'>
                  <div className='text-sm text-gray-400'>
                    Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
                    {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setAdminPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
                    >
                      Previous
                    </Button>
                    <span className='text-sm text-gray-400'>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setAdminPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className='border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ open, user: null })}
      >
        <AlertDialogContent className='bg-gray-900 border-gray-700'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-white'>Delete User</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-400'>
              Are you sure you want to delete user "{deleteDialog.user?.username}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='bg-gray-800 border-gray-700 text-white hover:bg-gray-700'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className='bg-red-600 text-white hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersPage;
