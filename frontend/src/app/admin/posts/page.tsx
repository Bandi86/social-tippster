'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPostsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Posts Management</h1>
        <p className='text-muted-foreground'>Manage and moderate user posts and content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts Management</CardTitle>
          <CardDescription>This page is coming soon. You will be able to:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
            <li>View all posts in the system</li>
            <li>Filter posts by status, author, and category</li>
            <li>Moderate and review reported posts</li>
            <li>Edit or remove inappropriate content</li>
            <li>Manage post categories and tags</li>
            <li>View post analytics and engagement metrics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
