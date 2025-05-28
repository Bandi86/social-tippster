'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { fetchAdminStats } from '@/lib/api/admin-apis/users';
import {
  AlertTriangle,
  Ban,
  BarChart,
  Settings,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AdminStats {
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
}

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stats on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const statsData = await fetchAdminStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load admin stats:', error);
        toast.error('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'from-amber-500 to-yellow-600',
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-blue-500 to-blue-600',
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
        <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-amber-500/20 p-8 shadow-xl backdrop-blur-sm'>
          <div className='flex items-center space-x-6'>
            <div className='p-4 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-xl shadow-lg ring-2 ring-amber-400/20'>
              <Shield className='h-10 w-10 text-black' />
            </div>
            <div className='flex-1'>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-3'>
                Admin Dashboard
              </h1>
              <p className='text-xl text-white mb-2'>
                Welcome back,{' '}
                <span className='text-amber-400 font-semibold'>
                  {user?.first_name || user?.username}!
                </span>
              </p>
              <p className='text-amber-300/80'>
                You have administrator access to manage the system.
              </p>
            </div>
          </div>

          <div className='mt-8 p-6 bg-gray-800/60 rounded-xl border border-amber-500/30 backdrop-blur-sm'>
            <h3 className='text-amber-400 font-semibold mb-4 flex items-center'>
              <UserCheck className='h-5 w-5 mr-2' />
              Administrator Details
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-sm'>
              <div className='flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg'>
                <Shield className='h-4 w-4 text-amber-400' />
                <div>
                  <span className='text-amber-300 font-medium'>Role:</span>
                  <span className='text-white ml-2 capitalize'>{user?.role}</span>
                </div>
              </div>
              <div className='flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg'>
                <Users className='h-4 w-4 text-amber-400' />
                <div>
                  <span className='text-amber-300 font-medium'>Email:</span>
                  <span className='text-white ml-2'>{user?.email}</span>
                </div>
              </div>
              <div className='flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg'>
                <BarChart className='h-4 w-4 text-amber-400' />
                <div>
                  <span className='text-amber-300 font-medium'>User ID:</span>
                  <span className='text-white ml-2 font-mono text-xs'>{user?.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Functions */}
        <div>
          <h2 className='text-3xl font-bold text-white mb-8 flex items-center'>
            <Settings className='h-8 w-8 text-amber-500 mr-3' />
            Admin Functions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {adminCards.map(card => {
              const Icon = card.icon;
              return (
                <Link key={card.title} href={card.href}>
                  <Card className='group bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer transform hover:scale-105'>
                    <CardHeader className='pb-4'>
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      >
                        <Icon className='h-8 w-8 text-white' />
                      </div>
                      <CardTitle className='text-white text-xl mb-2 group-hover:text-amber-400 transition-colors duration-200'>
                        {card.title}
                      </CardTitle>
                      <CardDescription className='text-gray-400 group-hover:text-gray-300 transition-colors duration-200'>
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
          <h2 className='text-2xl font-bold text-white mb-6'>System Statistics</h2>
          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className='bg-gray-900 border-amber-500/20'>
                  <CardContent className='p-6'>
                    <div className='text-center'>
                      <div className='h-8 w-16 bg-gray-700 rounded mx-auto mb-2 animate-pulse'></div>
                      <div className='h-4 w-20 bg-gray-700 rounded mx-auto animate-pulse'></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-amber-500/20 hover:border-amber-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-amber-500 mb-2'>{stats.total}</div>
                      <div className='text-sm text-gray-400'>Total Users</div>
                    </div>
                    <div className='p-3 bg-amber-500/10 rounded-lg'>
                      <Users className='h-8 w-8 text-amber-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/20 hover:border-green-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-green-500 mb-2'>{stats.active}</div>
                      <div className='text-sm text-gray-400'>Active Users</div>
                    </div>
                    <div className='p-3 bg-green-500/10 rounded-lg'>
                      <UserCheck className='h-8 w-8 text-green-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-blue-500 mb-2'>{stats.admins}</div>
                      <div className='text-sm text-gray-400'>Administrators</div>
                    </div>
                    <div className='p-3 bg-blue-500/10 rounded-lg'>
                      <Shield className='h-8 w-8 text-blue-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/20 hover:border-red-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-red-500 mb-2'>{stats.banned}</div>
                      <div className='text-sm text-gray-400'>Banned Users</div>
                    </div>
                    <div className='p-3 bg-red-500/10 rounded-lg'>
                      <Ban className='h-8 w-8 text-red-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-yellow-500 mb-2'>
                        {stats.unverified}
                      </div>
                      <div className='text-sm text-gray-400'>Unverified</div>
                    </div>
                    <div className='p-3 bg-yellow-500/10 rounded-lg'>
                      <AlertTriangle className='h-8 w-8 text-yellow-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-purple-500 mb-2'>
                        {stats.recentRegistrations}
                      </div>
                      <div className='text-sm text-gray-400'>This Month</div>
                    </div>
                    <div className='p-3 bg-purple-500/10 rounded-lg'>
                      <TrendingUp className='h-8 w-8 text-purple-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className='text-center py-12'>
              <AlertTriangle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
              <p className='text-gray-400'>Failed to load statistics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
