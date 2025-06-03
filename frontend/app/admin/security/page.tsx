// filepath: frontend/app/admin/security/page.tsx
// ===============================
// Admin Security Dashboard
// Real-time security monitoring and session management
// ===============================

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveSecurityStats, SecurityAlerts, SessionManager } from './components';

export default function SecurityDashboard() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Security Dashboard</h1>
          <p className='text-muted-foreground'>
            Monitor system security, manage user sessions, and view security alerts
          </p>
        </div>
      </div>

      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='sessions'>Sessions</TabsTrigger>
          <TabsTrigger value='alerts'>Security Alerts</TabsTrigger>
          <TabsTrigger value='monitoring'>Live Stats</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Real-time security metrics and system status</CardDescription>
              </CardHeader>
              <CardContent>
                <LiveSecurityStats compact />
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>Latest security events requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityAlerts limit={5} compact />
              </CardContent>
            </Card>
          </div>

          {/* Active Sessions Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions Summary</CardTitle>
              <CardDescription>Overview of currently active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionManager viewMode='summary' />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='sessions' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>View, monitor, and manage all user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionManager viewMode='full' />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='alerts' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Detailed view of security events and potential threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityAlerts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='monitoring' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Live Security Statistics</CardTitle>
              <CardDescription>
                Real-time security metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveSecurityStats />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
