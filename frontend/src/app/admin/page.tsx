'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart3, FileText, MessageSquare, Plus, TrendingUp, Users, UserX } from 'lucide-react';
import Link from 'next/link';

const statsCards = [
  {
    title: 'Total Users',
    value: '2,543',
    change: '+12.3%',
    changeType: 'increase' as const,
    icon: Users,
    description: 'Active users on platform',
  },
  {
    title: 'Total Posts',
    value: '1,867',
    change: '+8.1%',
    changeType: 'increase' as const,
    icon: FileText,
    description: 'Published content',
  },
  {
    title: 'Comments',
    value: '4,329',
    change: '+15.2%',
    changeType: 'increase' as const,
    icon: MessageSquare,
    description: 'User interactions',
  },
  {
    title: 'Banned Users',
    value: '23',
    change: '-2.1%',
    changeType: 'decrease' as const,
    icon: UserX,
    description: 'Moderated accounts',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'user_registered',
    user: 'john_doe',
    action: 'New user registered',
    time: '2 minutes ago',
    status: 'active',
  },
  {
    id: 2,
    type: 'post_reported',
    user: 'jane_smith',
    action: 'Post reported for spam',
    time: '15 minutes ago',
    status: 'pending',
  },
  {
    id: 3,
    type: 'user_banned',
    user: 'spammer123',
    action: 'User banned for violations',
    time: '1 hour ago',
    status: 'banned',
  },
  {
    id: 4,
    type: 'post_published',
    user: 'expert_tipper',
    action: 'New betting tip published',
    time: '2 hours ago',
    status: 'active',
  },
];

export default function AdminDashboard() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>Welcome to the Social Tippster admin panel</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button asChild>
            <Link href='/admin/users'>
              <Plus className='mr-2 h-4 w-4' />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {statsCards.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                  <span
                    className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}
                  >
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
                <p className='text-xs text-muted-foreground mt-1'>{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions and events on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>{activity.action}</p>
                      <p className='text-xs text-muted-foreground'>
                        User: {activity.user} • {activity.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.status === 'active'
                          ? 'default'
                          : activity.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  {index < recentActivity.length - 1 && <Separator className='mt-4' />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2'>
              <Button variant='outline' className='justify-start' asChild>
                <Link href='/admin/users'>
                  <Users className='mr-2 h-4 w-4' />
                  Manage Users
                </Link>
              </Button>
              <Button variant='outline' className='justify-start' asChild>
                <Link href='/admin/posts'>
                  <FileText className='mr-2 h-4 w-4' />
                  Review Posts
                </Link>
              </Button>
              <Button variant='outline' className='justify-start' asChild>
                <Link href='/admin/analytics'>
                  <BarChart3 className='mr-2 h-4 w-4' />
                  View Analytics
                </Link>
              </Button>
              <Button variant='outline' className='justify-start' asChild>
                <Link href='/admin/moderation'>
                  <TrendingUp className='mr-2 h-4 w-4' />
                  Moderation Queue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current platform health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='flex items-center space-x-2'>
              <div className='h-2 w-2 rounded-full bg-green-500'></div>
              <span className='text-sm'>Database: Healthy</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='h-2 w-2 rounded-full bg-green-500'></div>
              <span className='text-sm'>API: Operational</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
              <span className='text-sm'>Storage: Warning</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
