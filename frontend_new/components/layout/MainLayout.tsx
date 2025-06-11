import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function MainLayout({ children, leftSidebar, rightSidebar }: MainLayoutProps) {
  return (
    <div className='min-h-screen bg-background'>
    

      {/* Main Content Area */}
      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6'>
          {/* Left Sidebar */}
          <aside className='hidden lg:block lg:col-span-3'>
            {leftSidebar || (
              <div className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <div className='flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-smooth cursor-pointer'>
                      <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                        🏠
                      </div>
                      <span className='text-sm font-medium'>Home</span>
                    </div>
                    <div className='flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-smooth cursor-pointer'>
                      <div className='w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center'>
                        ⚽
                      </div>
                      <span className='text-sm font-medium'>Sports Tips</span>
                    </div>
                    <div className='flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-smooth cursor-pointer'>
                      <div className='w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center'>
                        👥
                      </div>
                      <span className='text-sm font-medium'>Following</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Your Stats</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>Tips Posted</span>
                      <Badge variant='outline'>12</Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>Success Rate</span>
                      <Badge variant='secondary'>67%</Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>Followers</span>
                      <Badge variant='default'>234</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </aside>

          {/* Main Content Feed */}
          <section className='col-span-1 lg:col-span-6'>{children}</section>

          {/* Right Sidebar */}
          <aside className='hidden lg:block lg:col-span-3'>
            {rightSidebar || (
              <div className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Trending Tips</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='sport-border pl-3'>
                      <p className='text-sm font-medium'>Premier League</p>
                      <p className='text-xs text-muted-foreground'>Manchester United vs Arsenal</p>
                      <Badge variant='confidence' className='text-xs mt-1'>
                        85% confident
                      </Badge>
                    </div>
                    <div className='border-l-4 border-secondary pl-3'>
                      <p className='text-sm font-medium'>Champions League</p>
                      <p className='text-xs text-muted-foreground'>Barcelona vs PSG</p>
                      <Badge variant='outline' className='text-xs mt-1'>
                        72% confident
                      </Badge>
                    </div>
                    <div className='border-l-4 border-accent pl-3'>
                      <p className='text-sm font-medium'>La Liga</p>
                      <p className='text-xs text-muted-foreground'>Real Madrid vs Atletico</p>
                      <Badge variant='confidence' className='text-xs mt-1'>
                        91% confident
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Top Tipsters</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        JD
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>John Doe</p>
                        <Badge variant='win' className='text-xs'>
                          94% success rate
                        </Badge>
                      </div>
                      <Button size='sm' variant='outline'>
                        Follow
                      </Button>
                    </div>
                    <Separator />
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        AS
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>Anna Smith</p>
                        <Badge variant='win' className='text-xs'>
                          89% success rate
                        </Badge>
                      </div>
                      <Button size='sm' variant='outline'>
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
