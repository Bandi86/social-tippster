'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchComprehensiveAnalytics,
  fetchUserStats,
  type ComprehensiveAnalytics,
  type UserStats,
} from '@/lib/api/admin-apis/analytics';
import {
  Activity,
  BarChart3,
  Download,
  FileText,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const AdminAnalyticsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userStatsData, comprehensiveData] = await Promise.all([
        fetchUserStats(),
        fetchComprehensiveAnalytics(),
      ]);
      setStats(userStatsData);
      setAnalytics(comprehensiveData);
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
            <div className='flex space-x-3'>
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant='outline'
                className='bg-gray-800/50 border-gray-600 hover:bg-gray-700'
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={exportData}
                className='bg-amber-600 hover:bg-amber-700 text-black font-semibold'
              >
                <Download className='h-4 w-4 mr-2' />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats Grid */}
        {stats && analytics && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {/* Users Card */}
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-blue-500 mb-2'>{stats.total}</div>
                    <div className='text-sm text-gray-400'>Total Users</div>
                    <div className='text-xs text-blue-400 mt-1'>
                      {stats.recentRegistrations} new this month
                    </div>
                  </div>
                  <div className='p-3 bg-blue-500/10 rounded-lg'>
                    <Users className='h-8 w-8 text-blue-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Card */}
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-green-500/20 hover:border-green-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-green-500 mb-2'>
                      {analytics.postStats.total}
                    </div>
                    <div className='text-sm text-gray-400'>Total Posts</div>
                    <div className='text-xs text-green-400 mt-1'>
                      {analytics.postStats.recentPosts} this week
                    </div>
                  </div>
                  <div className='p-3 bg-green-500/10 rounded-lg'>
                    <FileText className='h-8 w-8 text-green-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Card */}
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-purple-500 mb-2'>
                      {analytics.commentStats.total}
                    </div>
                    <div className='text-sm text-gray-400'>Total Comments</div>
                    <div className='text-xs text-purple-400 mt-1'>
                      {analytics.commentStats.recentComments} recent
                    </div>
                  </div>
                  <div className='p-3 bg-purple-500/10 rounded-lg'>
                    <MessageSquare className='h-8 w-8 text-purple-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users Card */}
            <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20 hover:border-amber-500/40 transition-all duration-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-amber-500 mb-2'>{stats.active}</div>
                    <div className='text-sm text-gray-400'>Active Users</div>
                    <div className='text-xs text-amber-400 mt-1'>
                      {Math.round((stats.active / stats.total) * 100)}% of total
                    </div>
                  </div>
                  <div className='p-3 bg-amber-500/10 rounded-lg'>
                    <UserCheck className='h-8 w-8 text-amber-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Analytics */}
        {analytics && (
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
                  {analytics.userGrowth.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-800/60 rounded-lg'
                    >
                      <span className='text-gray-300 font-medium'>{item.month}</span>
                      <div className='flex items-center space-x-3'>
                        <div className='w-32 bg-gray-700 rounded-full h-2'>
                          <div
                            className='bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500'
                            style={{ width: `${Math.min((item.users / 500) * 100, 100)}%` }}
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
                  {analytics.activityData.map((item, index) => (
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
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
