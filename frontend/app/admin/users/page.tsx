'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Shield, UserCheck, Users } from 'lucide-react';

const AdminUsersPage = () => {
  const { user } = useAuth();

  // Mock user data for demonstration
  const mockUsers = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@admin.com',
      role: 'admin' as const,
      is_active: true,
      is_banned: false,
      created_at: '2024-01-01',
    },
    {
      id: '2',
      username: 'testuser',
      email: 'user@test.com',
      role: 'user' as const,
      is_active: true,
      is_banned: false,
      created_at: '2024-01-15',
    },
    {
      id: '3',
      username: 'moderator',
      email: 'mod@test.com',
      role: 'moderator' as const,
      is_active: true,
      is_banned: false,
      created_at: '2024-01-10',
    },
  ];

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-amber-500 mb-2'>User Management</h1>
            <p className='text-gray-400'>Manage system users and their permissions</p>
          </div>
          <div className='flex items-center space-x-2'>
            <Users className='h-6 w-6 text-amber-500' />
            <span className='text-white font-medium'>{mockUsers.length} Total Users</span>
          </div>
        </div>

        <div className='grid gap-4'>
          {mockUsers.map(mockUser => (
            <Card key={mockUser.id} className='bg-gray-900 border-amber-500/20'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      <div className='h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center'>
                        <span className='text-black font-semibold text-lg'>
                          {mockUser.username[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-medium text-white'>{mockUser.username}</h3>
                      <p className='text-gray-400'>{mockUser.email}</p>
                      <p className='text-xs text-gray-500'>
                        Joined: {new Date(mockUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Badge
                      variant={mockUser.role === 'admin' ? 'default' : 'outline'}
                      className={
                        mockUser.role === 'admin'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black'
                          : mockUser.role === 'moderator'
                            ? 'border-blue-500/50 text-blue-400'
                            : 'border-amber-500/50 text-amber-300'
                      }
                    >
                      {mockUser.role === 'admin' && <Shield className='h-3 w-3 mr-1' />}
                      {mockUser.role === 'moderator' && <UserCheck className='h-3 w-3 mr-1' />}
                      {mockUser.role}
                    </Badge>

                    {mockUser.is_active ? (
                      <Badge className='bg-green-500/20 text-green-400 border-green-500/50'>
                        Active
                      </Badge>
                    ) : (
                      <Badge className='bg-red-500/20 text-red-400 border-red-500/50'>
                        <AlertTriangle className='h-3 w-3 mr-1' />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className='bg-gray-900 border-amber-500/20'>
          <CardHeader>
            <CardTitle className='text-amber-500'>Admin Actions</CardTitle>
            <CardDescription className='text-gray-400'>
              Administrative functions available to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-4 bg-gray-800 rounded-lg border border-amber-500/30'>
                <h4 className='font-medium text-white mb-2'>Role Management</h4>
                <p className='text-sm text-gray-400'>Promote or demote user roles</p>
              </div>
              <div className='p-4 bg-gray-800 rounded-lg border border-amber-500/30'>
                <h4 className='font-medium text-white mb-2'>User Moderation</h4>
                <p className='text-sm text-gray-400'>Ban or suspend user accounts</p>
              </div>
              <div className='p-4 bg-gray-800 rounded-lg border border-amber-500/30'>
                <h4 className='font-medium text-white mb-2'>System Stats</h4>
                <p className='text-sm text-gray-400'>View system usage analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsersPage;
