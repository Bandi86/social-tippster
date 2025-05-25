'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Admin Settings</h1>
        <p className='text-muted-foreground'>Configure platform settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            This page is coming soon. You will be able to configure:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
            <li>Platform general settings</li>
            <li>User registration and verification settings</li>
            <li>Content moderation policies</li>
            <li>Email notification templates</li>
            <li>Security and authentication settings</li>
            <li>API rate limiting and quotas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
