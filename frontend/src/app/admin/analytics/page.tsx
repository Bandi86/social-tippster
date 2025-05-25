'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAnalyticsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Analytics</h1>
        <p className='text-muted-foreground'>Platform analytics and usage statistics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>This page is coming soon. You will be able to view:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
            <li>User growth and engagement metrics</li>
            <li>Content creation and interaction statistics</li>
            <li>Popular posts and trending content</li>
            <li>Geographic user distribution</li>
            <li>Platform performance metrics</li>
            <li>Revenue and monetization analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
