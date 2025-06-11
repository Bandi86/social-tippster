import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Target, TrendingUp, Trophy } from 'lucide-react';

export default function DesignShowcase() {
  return (
    <MainLayout>
      <div className='space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-4xl font-bold mb-4'>
            <span className='sport-accent'>Design System</span> Showcase
          </h1>
          <p className='text-muted-foreground'>
            A comprehensive overview of our sports-themed design system with shadcn/ui components
          </p>
        </div>

        {/* Component Showcase */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Buttons Section */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles for different actions</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap gap-2'>
                <Button variant='default'>Default</Button>
                <Button variant='secondary'>Secondary</Button>
                <Button variant='sport'>Sport Gradient</Button>
                <Button variant='accent'>Accent</Button>
                <Button variant='destructive'>Destructive</Button>
                <Button variant='outline'>Outline</Button>
                <Button variant='ghost'>Ghost</Button>
                <Button variant='link'>Link</Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button size='sm' variant='sport'>
                  Small
                </Button>
                <Button size='default' variant='sport'>
                  Default
                </Button>
                <Button size='lg' variant='sport'>
                  Large
                </Button>
                <Button size='icon' variant='sport'>
                  <Trophy className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input fields and form elements</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Username</label>
                <Input placeholder='Enter your username' />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Bio</label>
                <Textarea placeholder='Tell us about yourself...' />
              </div>
              <Button variant='sport' className='w-full'>
                <Target className='h-4 w-4 mr-2' />
                Submit Tip
              </Button>
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='default'>Default</Badge>
                <Badge variant='secondary'>Secondary</Badge>
                <Badge variant='destructive'>Destructive</Badge>
                <Badge variant='outline'>Outline</Badge>
                <Badge variant='confidence'>95% Confidence</Badge>
                <Badge variant='win'>Win</Badge>
                <Badge variant='loss'>Loss</Badge>
                <Badge variant='push'>Push</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
              <CardDescription>User profile pictures and fallbacks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-4'>
                <Avatar>
                  <AvatarImage src='/api/placeholder/40/40' alt='User' />
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <Avatar className='h-12 w-12'>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className='h-16 w-16'>
                  <AvatarFallback className='text-lg'>MT</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Sports-Themed Sample Components */}
        <div className='space-y-6'>
          <h2 className='text-2xl font-semibold text-center'>Sports Tippster Components</h2>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Sample Tip Card */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <Avatar>
                      <AvatarFallback>PT</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className='text-lg'>Pro Tipster</CardTitle>
                      <CardDescription>2 hours ago</CardDescription>
                    </div>
                  </div>
                  <Badge variant='confidence'>89% Confidence</Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='font-semibold text-lg mb-2'>
                    Lakers vs Warriors - Over 220.5 Points
                  </h3>
                  <p className='text-muted-foreground'>
                    Both teams have been scoring at a high pace recently. Lakers averaging 118 PPG
                    over last 5 games.
                  </p>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex space-x-4'>
                    <Button variant='ghost' size='sm'>
                      <Heart className='h-4 w-4 mr-1' />
                      24
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <MessageCircle className='h-4 w-4 mr-1' />8
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <Share2 className='h-4 w-4 mr-1' />
                      Share
                    </Button>
                  </div>
                  <Badge variant='outline'>NBA</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <TrendingUp className='h-5 w-5' />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center space-y-1'>
                    <div className='text-2xl font-bold text-primary'>68%</div>
                    <div className='text-sm text-muted-foreground'>Win Rate</div>
                  </div>
                  <div className='text-center space-y-1'>
                    <div className='text-2xl font-bold text-secondary'>156</div>
                    <div className='text-sm text-muted-foreground'>Tips Posted</div>
                  </div>
                  <div className='text-center space-y-1'>
                    <div className='text-2xl font-bold text-accent'>$2,340</div>
                    <div className='text-sm text-muted-foreground'>Total Profit</div>
                  </div>
                  <div className='text-center space-y-1'>
                    <div className='text-2xl font-bold text-primary'>12</div>
                    <div className='text-sm text-muted-foreground'>Followers</div>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Recent Performance</span>
                    <Badge variant='win'>5W Streak</Badge>
                  </div>
                  <div className='flex space-x-1'>
                    {['W', 'W', 'W', 'W', 'W', 'L', 'W'].map((result, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-secondary text-white' : 'bg-destructive text-white'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog Example */}
        <div className='text-center'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='sport' size='lg'>
                <Trophy className='h-4 w-4 mr-2' />
                Open Example Modal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a New Tip</DialogTitle>
                <DialogDescription>
                  Share your sports prediction with the community.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Game/Match</label>
                  <Input placeholder='e.g., Lakers vs Warriors' />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Your Prediction</label>
                  <Textarea placeholder='Explain your tip and reasoning...' />
                </div>
                <div className='flex space-x-2'>
                  <Button variant='sport' className='flex-1'>
                    Post Tip
                  </Button>
                  <Button variant='outline' className='flex-1'>
                    Save Draft
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Color Palette Section */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Our sports-themed color system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* Primary Colors */}
              <div>
                <h3 className='text-lg font-medium mb-3'>Primary (Blue)</h3>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-primary-500 rounded'></div>
                    <span className='text-sm'>Primary 500</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-primary-600 rounded'></div>
                    <span className='text-sm'>Primary 600 (Default)</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-primary-700 rounded'></div>
                    <span className='text-sm'>Primary 700</span>
                  </div>
                </div>
              </div>

              {/* Secondary Colors */}
              <div>
                <h3 className='text-lg font-medium mb-3'>Secondary (Green)</h3>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-secondary-500 rounded'></div>
                    <span className='text-sm'>Secondary 500</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-secondary-600 rounded'></div>
                    <span className='text-sm'>Secondary 600 (Default)</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-secondary-700 rounded'></div>
                    <span className='text-sm'>Secondary 700</span>
                  </div>
                </div>
              </div>

              {/* Accent Colors */}
              <div>
                <h3 className='text-lg font-medium mb-3'>Accent (Orange)</h3>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-accent-500 rounded'></div>
                    <span className='text-sm'>Accent 500 (Default)</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-accent-600 rounded'></div>
                    <span className='text-sm'>Accent 600</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-accent-700 rounded'></div>
                    <span className='text-sm'>Accent 700</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
