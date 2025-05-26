'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Settings, Shield, Users } from 'lucide-react';
import Link from 'next/link';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Analytics',
      description: 'View system usage and statistics',
      icon: BarChart,
      href: '/admin/analytics',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='bg-gray-900 rounded-lg border border-amber-500/20 p-6'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg'>
              <Shield className='h-8 w-8 text-black' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-amber-500 mb-2'>Admin Dashboard</h1>
              <p className='text-white mb-2'>Welcome, {user?.first_name || user?.username}!</p>
              <p className='text-amber-400'>You have admin access to this protected area.</p>
            </div>
          </div>

          <div className='mt-6 p-4 bg-gray-800 rounded border border-amber-500/30'>
            <h3 className='text-amber-500 font-semibold mb-2'>User Details:</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div>
                <span className='text-amber-400'>Role:</span>
                <span className='text-white ml-2'>{user?.role}</span>
              </div>
              <div>
                <span className='text-amber-400'>Email:</span>
                <span className='text-white ml-2'>{user?.email}</span>
              </div>
              <div>
                <span className='text-amber-400'>User ID:</span>
                <span className='text-white ml-2'>{user?.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Functions */}
        <div>
          <h2 className='text-2xl font-bold text-white mb-6'>Admin Functions</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {adminCards.map(card => {
              const Icon = card.icon;
              return (
                <Link key={card.title} href={card.href}>
                  <Card className='bg-gray-900 border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer'>
                    <CardHeader className='pb-4'>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}
                      >
                        <Icon className='h-6 w-6 text-white' />
                      </div>
                      <CardTitle className='text-white'>{card.title}</CardTitle>
                      <CardDescription className='text-gray-400'>
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className='text-2xl font-bold text-white mb-6'>Quick Stats</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <Card className='bg-gray-900 border-amber-500/20'>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-amber-500 mb-2'>3</div>
                  <div className='text-sm text-gray-400'>Total Users</div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-gray-900 border-amber-500/20'>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-green-500 mb-2'>1</div>
                  <div className='text-sm text-gray-400'>Active Admins</div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-gray-900 border-amber-500/20'>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-blue-500 mb-2'>2</div>
                  <div className='text-sm text-gray-400'>Regular Users</div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-gray-900 border-amber-500/20'>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-purple-500 mb-2'>100%</div>
                  <div className='text-sm text-gray-400'>System Health</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
