'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { adminUsersAPI } from '@/lib/api/admin-users';
import { User, UserFilters } from '@/types';
import {
  Ban,
  Check,
  Eye,
  MoreHorizontal,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: 'ban' | 'unban' | 'delete' | 'verify' | 'role';
    user: User;
    reason?: string;
  } | null>(null);

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: 'all',
    role: 'all',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUsersAPI.getUsers(filters);

      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleUserAction = async (action: string, user: User, reason?: string) => {
    try {
      let response;

      switch (action) {
        case 'ban':
          response = await adminUsersAPI.banUser(user.id, reason);
          break;
        case 'unban':
          response = await adminUsersAPI.unbanUser(user.id);
          break;
        case 'verify':
          response = await adminUsersAPI.verifyUser(user.id);
          break;
        case 'unverify':
          response = await adminUsersAPI.unverifyUser(user.id);
          break;
        case 'makeAdmin':
          response = await adminUsersAPI.changeUserRole(user.id, 'admin');
          break;
        case 'removeAdmin':
          response = await adminUsersAPI.changeUserRole(user.id, 'user');
          break;
        case 'delete':
          response = await adminUsersAPI.deleteUser(user.id);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `User ${action} completed successfully`,
        });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(response.message || 'Action failed');
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} user`,
        variant: 'destructive',
      });
    }
    setActionDialog(null);
  };

  const getUserStatusBadge = (user: User) => {
    if (user.isBanned) {
      return <Badge variant='destructive'>Banned</Badge>;
    }
    if (!user.isVerified) {
      return <Badge variant='secondary'>Unverified</Badge>;
    }
    return <Badge variant='outline'>Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'admin' ? 'default' : 'outline'}>
        {role === 'admin' ? (
          <>
            <Shield className='w-3 h-3 mr-1' />
            Admin
          </>
        ) : (
          'User'
        )}
      </Badge>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Users Management</h1>
          <p className='text-muted-foreground'>Manage user accounts, roles, and permissions</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='outline'>{totalUsers} total users</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='space-y-2'>
              <Label>Search</Label>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search users...'
                  className='pl-8'
                  value={filters.search || ''}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={value => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='banned'>Banned</SelectItem>
                  <SelectItem value='unverified'>Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Role</Label>
              <Select
                value={filters.role || 'all'}
                onValueChange={value => handleFilterChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  <SelectItem value='user'>User</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={value => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='createdAt'>Join Date</SelectItem>
                  <SelectItem value='lastLoginAt'>Last Login</SelectItem>
                  <SelectItem value='username'>Username</SelectItem>
                  <SelectItem value='postsCount'>Posts Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>List of all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className='flex items-center space-x-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm'>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className='font-medium'>{user.username}</div>
                            <div className='text-sm text-muted-foreground'>{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getUserStatusBadge(user)}</TableCell>
                      <TableCell>{user.postsCount || 0}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Eye className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>

                            {user.isVerified ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionDialog({
                                    type: 'verify',
                                    user,
                                  })
                                }
                              >
                                <UserX className='mr-2 h-4 w-4' />
                                Unverify
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionDialog({
                                    type: 'verify',
                                    user,
                                  })
                                }
                              >
                                <UserCheck className='mr-2 h-4 w-4' />
                                Verify
                              </DropdownMenuItem>
                            )}

                            {user.isBanned ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionDialog({
                                    type: 'unban',
                                    user,
                                  })
                                }
                              >
                                <Check className='mr-2 h-4 w-4' />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionDialog({
                                    type: 'ban',
                                    user,
                                  })
                                }
                              >
                                <Ban className='mr-2 h-4 w-4' />
                                Ban User
                              </DropdownMenuItem>
                            )}

                            {user.role === 'admin' ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionDialog({
                                    type: 'role',
                                    user,
                                  })
                                }
                              >
                                <ShieldOff className='mr-2 h-4 w-4' />
                                Remove Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionDialog({
                                    type: 'role',
                                    user,
                                  })
                                }
                              >
                                <Shield className='mr-2 h-4 w-4' />
                                Make Admin
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-red-600'
                              onClick={() =>
                                setActionDialog({
                                  type: 'delete',
                                  user,
                                })
                              }
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
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
                <div className='flex items-center justify-between space-x-2 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {(currentPage - 1) * (filters.limit || 10) + 1} to{' '}
                    {Math.min(currentPage * (filters.limit || 10), totalUsers)} of {totalUsers}{' '}
                    users
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className='flex items-center space-x-1'>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          page =>
                            page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
                        )
                        .map((page, index, array) => (
                          <div key={page} className='flex items-center'>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className='px-2'>...</span>
                            )}
                            <Button
                              variant={page === currentPage ? 'default' : 'outline'}
                              size='sm'
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
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

      {/* Action Confirmation Dialog */}
      {actionDialog && (
        <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'ban' && 'Ban User'}
                {actionDialog.type === 'unban' && 'Unban User'}
                {actionDialog.type === 'delete' && 'Delete User'}
                {actionDialog.type === 'verify' &&
                  (actionDialog.user.isVerified ? 'Unverify User' : 'Verify User')}
                {actionDialog.type === 'role' &&
                  (actionDialog.user.role === 'admin' ? 'Remove Admin Role' : 'Grant Admin Role')}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'ban' &&
                  `Are you sure you want to ban ${actionDialog.user.username}? This will prevent them from accessing the platform.`}
                {actionDialog.type === 'unban' &&
                  `Are you sure you want to unban ${actionDialog.user.username}? They will regain access to the platform.`}
                {actionDialog.type === 'delete' &&
                  `Are you sure you want to delete ${actionDialog.user.username}? This action cannot be undone.`}
                {actionDialog.type === 'verify' &&
                  actionDialog.user.isVerified &&
                  `Are you sure you want to unverify ${actionDialog.user.username}?`}
                {actionDialog.type === 'verify' &&
                  !actionDialog.user.isVerified &&
                  `Are you sure you want to verify ${actionDialog.user.username}?`}
                {actionDialog.type === 'role' &&
                  actionDialog.user.role === 'admin' &&
                  `Are you sure you want to remove admin privileges from ${actionDialog.user.username}?`}
                {actionDialog.type === 'role' &&
                  actionDialog.user.role !== 'admin' &&
                  `Are you sure you want to grant admin privileges to ${actionDialog.user.username}?`}
              </DialogDescription>
            </DialogHeader>

            {actionDialog.type === 'ban' && (
              <div className='space-y-2'>
                <Label htmlFor='reason'>Reason (optional)</Label>
                <Textarea
                  id='reason'
                  placeholder='Enter reason for banning...'
                  value={actionDialog.reason || ''}
                  onChange={e =>
                    setActionDialog({
                      ...actionDialog,
                      reason: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <DialogFooter>
              <Button variant='outline' onClick={() => setActionDialog(null)}>
                Cancel
              </Button>
              <Button
                variant={
                  actionDialog.type === 'delete' || actionDialog.type === 'ban'
                    ? 'destructive'
                    : 'default'
                }
                onClick={() => {
                  if (actionDialog.type === 'ban') {
                    handleUserAction('ban', actionDialog.user, actionDialog.reason);
                  } else if (actionDialog.type === 'unban') {
                    handleUserAction('unban', actionDialog.user);
                  } else if (actionDialog.type === 'delete') {
                    handleUserAction('delete', actionDialog.user);
                  } else if (actionDialog.type === 'verify') {
                    handleUserAction(
                      actionDialog.user.isVerified ? 'unverify' : 'verify',
                      actionDialog.user,
                    );
                  } else if (actionDialog.type === 'role') {
                    handleUserAction(
                      actionDialog.user.role === 'admin' ? 'removeAdmin' : 'makeAdmin',
                      actionDialog.user,
                    );
                  }
                }}
              >
                {actionDialog.type === 'ban' && 'Ban User'}
                {actionDialog.type === 'unban' && 'Unban User'}
                {actionDialog.type === 'delete' && 'Delete User'}
                {actionDialog.type === 'verify' &&
                  (actionDialog.user.isVerified ? 'Unverify' : 'Verify')}
                {actionDialog.type === 'role' &&
                  (actionDialog.user.role === 'admin' ? 'Remove Admin' : 'Grant Admin')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedUser.username}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Username</Label>
                  <div className='text-sm'>{selectedUser.username}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Email</Label>
                  <div className='text-sm'>{selectedUser.email}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Role</Label>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Status</Label>
                  <div>{getUserStatusBadge(selectedUser)}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Posts Count</Label>
                  <div className='text-sm'>{selectedUser.postsCount || 0}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Followers</Label>
                  <div className='text-sm'>{selectedUser.followersCount || 0}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Following</Label>
                  <div className='text-sm'>{selectedUser.followingCount || 0}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Joined</Label>
                  <div className='text-sm'>{new Date(selectedUser.createdAt).toLocaleString()}</div>
                </div>
                <div className='space-y-2'>
                  <Label>Last Login</Label>
                  <div className='text-sm'>
                    {selectedUser.lastLoginAt
                      ? new Date(selectedUser.lastLoginAt).toLocaleString()
                      : 'Never'}
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div className='space-y-2'>
                  <Label>Bio</Label>
                  <div className='text-sm p-3 bg-muted rounded-md'>{selectedUser.bio}</div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
