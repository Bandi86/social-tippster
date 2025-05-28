'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  banUser,
  fetchUserById,
  revokeUserEmailVerification,
  unbanUser,
  updateUserRole,
  verifyUserEmail,
} from '@/lib/api/admin-apis/users';
import { User } from '@/types/index';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Shield,
  UserCheck,
  User as UserIcon,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserPageProps {
  params: {
    id: string;
  };
}

const UserPage = ({ params }: UserPageProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserById(params.id);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        toast.error('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [params.id]);

  const handleAction = async (action: string, actionFn: () => Promise<void>) => {
    setActionLoading(action);
    try {
      await actionFn();
      toast.success(`User ${action} successfully`);
      // Reload user data
      const userData = await fetchUserById(params.id);
      setUser(userData);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <UserIcon className='h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse' />
            <p className='text-gray-400'>Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center py-12'>
          <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white mb-2'>User Not Found</h2>
          <p className='text-gray-400 mb-6'>The user you're looking for doesn't exist.</p>
          <Link href='/admin/users'>
            <Button className='bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-amber-500/20 p-8 shadow-xl backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-6'>
              <Link href='/admin/users'>
                <Button
                  variant='outline'
                  className='border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Users
                </Button>
              </Link>
              <div className='flex items-center space-x-4'>
                <div className='p-4 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-xl shadow-lg ring-2 ring-amber-400/20'>
                  <UserIcon className='h-10 w-10 text-black' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2'>
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </h1>
                  <p className='text-gray-400'>@{user.username}</p>
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Badge variant={user.is_active ? 'default' : 'destructive'} className='px-3 py-1'>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge
                variant={user.role === 'admin' ? 'default' : 'secondary'}
                className='px-3 py-1'
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* User Details */}
          <div className='lg:col-span-2 space-y-6'>
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <UserIcon className='h-5 w-5 mr-2 text-amber-500' />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-amber-400 font-medium text-sm'>Email</label>
                    <div className='flex items-center space-x-2 p-3 bg-gray-800/60 rounded-lg'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      <span className='text-white'>{user.email}</span>
                      {user.is_verified ? (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      ) : (
                        <XCircle className='h-4 w-4 text-red-500' />
                      )}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-amber-400 font-medium text-sm'>Username</label>
                    <div className='flex items-center space-x-2 p-3 bg-gray-800/60 rounded-lg'>
                      <UserIcon className='h-4 w-4 text-gray-400' />
                      <span className='text-white'>{user.username}</span>
                    </div>
                  </div>
                  {user.first_name && (
                    <div className='space-y-2'>
                      <label className='text-amber-400 font-medium text-sm'>First Name</label>
                      <div className='p-3 bg-gray-800/60 rounded-lg'>
                        <span className='text-white'>{user.first_name}</span>
                      </div>
                    </div>
                  )}
                  {user.last_name && (
                    <div className='space-y-2'>
                      <label className='text-amber-400 font-medium text-sm'>Last Name</label>
                      <div className='p-3 bg-gray-800/60 rounded-lg'>
                        <span className='text-white'>{user.last_name}</span>
                      </div>
                    </div>
                  )}
                </div>
                <Separator className='bg-gray-700' />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-amber-400 font-medium text-sm'>Created At</label>
                    <div className='flex items-center space-x-2 p-3 bg-gray-800/60 rounded-lg'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <span className='text-white'>
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-amber-400 font-medium text-sm'>Last Login</label>
                    <div className='flex items-center space-x-2 p-3 bg-gray-800/60 rounded-lg'>
                      <Clock className='h-4 w-4 text-gray-400' />
                      <span className='text-white'>
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className='space-y-6'>
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <Shield className='h-5 w-5 mr-2 text-amber-500' />
                  Admin Actions
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  Manage user permissions and status
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Ban/Unban */}
                <Button
                  onClick={() =>
                    handleAction(
                      user.is_banned ? 'unban' : 'ban',
                      user.is_banned ? () => unbanUser(user.id) : () => banUser(user.id),
                    )
                  }
                  disabled={actionLoading === (user.is_banned ? 'unban' : 'ban')}
                  variant={user.is_banned ? 'default' : 'destructive'}
                  className='w-full'
                >
                  {user.is_banned ? (
                    <>
                      <UserCheck className='h-4 w-4 mr-2' />
                      Unban User
                    </>
                  ) : (
                    <>
                      <Ban className='h-4 w-4 mr-2' />
                      Ban User
                    </>
                  )}
                </Button>

                {/* Verify/Unverify Email */}
                <Button
                  onClick={() =>
                    handleAction(
                      user.is_verified ? 'unverify' : 'verify',
                      user.is_verified
                        ? () => revokeUserEmailVerification(user.id)
                        : () => verifyUserEmail(user.id),
                    )
                  }
                  disabled={actionLoading === (user.is_verified ? 'unverify' : 'verify')}
                  variant='outline'
                  className='w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                >
                  {user.is_verified ? (
                    <>
                      <XCircle className='h-4 w-4 mr-2' />
                      Unverify Email
                    </>
                  ) : (
                    <>
                      <CheckCircle className='h-4 w-4 mr-2' />
                      Verify Email
                    </>
                  )}
                </Button>

                {/* Role Management */}
                <div className='space-y-2'>
                  <label className='text-amber-400 font-medium text-sm'>Change Role</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      onClick={() =>
                        handleAction('promote', () => updateUserRole(user.id, 'admin'))
                      }
                      disabled={user.role === 'admin' || actionLoading === 'promote'}
                      variant='outline'
                      size='sm'
                      className='border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                    >
                      Make Admin
                    </Button>
                    <Button
                      onClick={() => handleAction('demote', () => updateUserRole(user.id, 'user'))}
                      disabled={user.role === 'user' || actionLoading === 'demote'}
                      variant='outline'
                      size='sm'
                      className='border-gray-500/30 text-gray-400 hover:bg-gray-500/10'
                    >
                      Make User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20'>
              <CardHeader>
                <CardTitle className='text-white'>Status Overview</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-gray-800/60 rounded-lg'>
                  <span className='text-gray-300'>Account Status</span>
                  <Badge variant={user.is_active ? 'default' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-800/60 rounded-lg'>
                  <span className='text-gray-300'>Email Verification</span>
                  <Badge variant={user.is_verified ? 'default' : 'secondary'}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-800/60 rounded-lg'>
                  <span className='text-gray-300'>Ban Status</span>
                  <Badge variant={user.is_banned ? 'destructive' : 'default'}>
                    {user.is_banned ? 'Banned' : 'Not Banned'}
                  </Badge>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-800/60 rounded-lg'>
                  <span className='text-gray-300'>Role</span>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
