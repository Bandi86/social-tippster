import { MainFeed } from '@/components/feed/FeedPost';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      <MainLayout>
        <div className='space-y-6'>
          {/* Welcome Banner */}
          <Card className='sport-gradient-bg'>
            <CardContent className='p-6'>
              <h1 className='text-3xl font-bold mb-2'>
                Welcome to <span className='sport-accent'>Social Tippster</span>
              </h1>
              <p className='text-muted-foreground mb-4'>
                Share your sports predictions, follow expert tipsters, and build your reputation in
                the community.
              </p>
              <div className='flex space-x-4'>
                <Button variant='sport' asChild>
                  <Link href='/auth/login'>Login</Link>
                </Button>
                <Button variant='secondary' asChild>
                  <Link href='/auth/register'>Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Main Feed */}
          <MainFeed />
        </div>
      </MainLayout>
    </div>
  );
}
