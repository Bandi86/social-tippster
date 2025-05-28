'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { fetchAdminStats } from '@/lib/api/admin-apis/users';
import {
  Activity,
  Ban,
  BarChart3,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
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

interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  activityData: { date: string; logins: number; registrations: number }[];
  topPages: { page: string; views: number }[];
}

const AdminAnalyticsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock analytics data - in real app this would come from API
  const mockAnalytics: AnalyticsData = {
    userGrowth: [
      { month: 'Jan', users: 120 },
      { month: 'Feb', users: 150 },
      { month: 'Mar', users: 200 },
      { month: 'Apr', users: 280 },
      { month: 'May', users: 350 },
      { month: 'Jun', users: 420 },
    ],
    activityData: [
      { date: 'Mon', logins: 45, registrations: 8 },
      { date: 'Tue', logins: 52, registrations: 12 },
      { date: 'Wed', logins: 38, registrations: 6 },
      { date: 'Thu', logins: 61, registrations: 15 },
      { date: 'Fri', logins: 73, registrations: 22 },
      { date: 'Sat', logins: 35, registrations: 9 },
      { date: 'Sun', logins: 28, registrations: 4 },
    ],
    topPages: [
      { page: '/dashboard', views: 1250 },
      { page: '/profile', views: 890 },
      { page: '/settings', views: 640 },
      { page: '/admin/users', views: 320 },
      { page: '/admin', views: 280 },
    ],
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await fetchAdminStats();
      setStats(statsData);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportData = () => {
    const data = {
      stats,
      analytics,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported');
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <RefreshCw className='h-12 w-12 text-amber-500 mx-auto mb-4 animate-spin' />
            <p className='text-gray-400'>Loading analytics data...</p>
          </div>
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
              <div className='p-4 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-xl shadow-lg ring-2 ring-amber-400/20'>
                <BarChart3 className='h-10 w-10 text-black' />
              </div>
              <div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2'>
                  Analytics & Reports
                </h1>
                <p className='text-gray-400'>System usage statistics and performance insights</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant='outline'
                className='border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
              >
                {refreshing ? (
                  <RefreshCw className='h-4 w-4 animate-spin' />
                ) : (
                  <RefreshCw className='h-4 w-4' />
                )}
              </Button>
              <Button
                onClick={exportData}
                className='bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold'
              >
                <Download className='h-4 w-4 mr-2' />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20 hover:border-amber-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-amber-500 mb-2'>{stats.total}</div>
                    <div className='text-sm text-gray-400'>Total Users</div>
                    <div className='text-xs text-green-400 mt-1'>
                      +{stats.recentRegistrations} this month
                    </div>
                  </div>
                  <div className='p-3 bg-amber-500/10 rounded-lg'>
                    <Users className='h-8 w-8 text-amber-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-green-500/20 hover:border-green-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-green-500 mb-2'>{stats.active}</div>
                    <div className='text-sm text-gray-400'>Active Users</div>
                    <div className='text-xs text-green-400 mt-1'>
                      {Math.round((stats.active / stats.total) * 100)}% of total
                    </div>
                  </div>
                  <div className='p-3 bg-green-500/10 rounded-lg'>
                    <UserCheck className='h-8 w-8 text-green-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-blue-500 mb-2'>{stats.admins}</div>
                    <div className='text-sm text-gray-400'>Administrators</div>
                    <div className='text-xs text-blue-400 mt-1'>System managers</div>
                  </div>
                  <div className='p-3 bg-blue-500/10 rounded-lg'>
                    <Activity className='h-8 w-8 text-blue-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-red-500/20 hover:border-red-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-red-500 mb-2'>{stats.banned}</div>
                    <div className='text-sm text-gray-400'>Banned Users</div>
                    <div className='text-xs text-red-400 mt-1'>
                      {Math.round((stats.banned / stats.total) * 100)}% of total
                    </div>
                  </div>
                  <div className='p-3 bg-red-500/10 rounded-lg'>
                    <Ban className='h-8 w-8 text-red-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Analytics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* User Growth Chart */}
          <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20'>
            <CardHeader>
              <div className='flex items-center space-x-4'>
                <div className='p-3 bg-purple-500/10 rounded-lg'>
                  <TrendingUp className='h-6 w-6 text-purple-500' />
                </div>
                <div>
                  <CardTitle className='text-white'>User Growth</CardTitle>
                  <CardDescription className='text-gray-400'>
                    Monthly user registrations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {analytics?.userGrowth.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-gray-800/60 rounded-lg'
                  >
                    <span className='text-gray-300 font-medium'>{item.month}</span>
                    <div className='flex items-center space-x-3'>
                      <div className='w-32 bg-gray-700 rounded-full h-2'>
                        <div
                          className='bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500'
                          style={{ width: `${(item.users / 500) * 100}%` }}
                        ></div>
                      </div>
                      <span className='text-purple-400 font-bold w-12 text-right'>
                        {item.users}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20'>
            <CardHeader>
              <div className='flex items-center space-x-4'>
                <div className='p-3 bg-blue-500/10 rounded-lg'>
                  <Activity className='h-6 w-6 text-blue-500' />
                </div>
                <div>
                  <CardTitle className='text-white'>Weekly Activity</CardTitle>
                  <CardDescription className='text-gray-400'>
                    Logins and registrations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {analytics?.activityData.map((item, index) => (
                  <div key={index} className='p-3 bg-gray-800/60 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-gray-300 font-medium'>{item.date}</span>
                      <div className='text-sm text-gray-400'>
                        {item.logins + item.registrations} total
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-blue-400'>Logins</span>
                        <span className='text-white font-medium'>{item.logins}</span>
                      </div>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-green-400'>Registrations</span>
                        <span className='text-white font-medium'>{item.registrations}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20'>
          <CardHeader>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-amber-500/10 rounded-lg'>
                <Eye className='h-6 w-6 text-amber-500' />
              </div>
              <div>
                <CardTitle className='text-white'>Most Visited Pages</CardTitle>
                <CardDescription className='text-gray-400'>
                  Page views in the last 30 days
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
              {analytics?.topPages.map((page, index) => (
                <div
                  key={index}
                  className='p-4 bg-gray-800/60 rounded-lg border border-gray-700/50 hover:border-amber-500/30 transition-colors'
                >
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-amber-500 mb-2'>{page.views}</div>
                    <div className='text-sm text-gray-400 break-all'>{page.page}</div>
                    <div className='text-xs text-gray-500 mt-1'>views</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
