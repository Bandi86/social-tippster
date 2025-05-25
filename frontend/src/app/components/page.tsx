'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Bell,
  ChevronRight,
  Download,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Share,
  Star,
  User,
} from 'lucide-react';
import { useState } from 'react';

export default function ComponentShowcase() {
  const [likes, setLikes] = useState(42);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    toast({
      title: isLiked ? 'Unliked!' : 'Liked!',
      description: `You ${isLiked ? 'unliked' : 'liked'} this post.`,
    });
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-2xl font-bold'>shadcn/ui Showcase</h1>
              <Badge variant='secondary'>New York Style</Badge>
            </div>
            <div className='flex items-center space-x-4'>
              <ModeToggle />
              <Avatar>
                <AvatarImage src='https://github.com/shadcn.png' />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        {/* Breadcrumbs */}
        <Breadcrumb className='mb-6'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/'>
                <Home className='h-4 w-4' />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href='/components'>Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Showcase</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs defaultValue='components' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='components'>Components</TabsTrigger>
            <TabsTrigger value='forms'>Forms</TabsTrigger>
            <TabsTrigger value='layout'>Layout</TabsTrigger>
            <TabsTrigger value='navigation'>Navigation</TabsTrigger>
          </TabsList>

          <TabsContent value='components' className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {/* Buttons Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>Different button variants and sizes</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    <Button>Default</Button>
                    <Button variant='secondary'>Secondary</Button>
                    <Button variant='outline'>Outline</Button>
                    <Button variant='ghost'>Ghost</Button>
                    <Button variant='destructive'>Destructive</Button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <Button size='sm'>Small</Button>
                    <Button size='default'>Default</Button>
                    <Button size='lg'>Large</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Various badge styles and colors</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    <Badge>Default</Badge>
                    <Badge variant='secondary'>Secondary</Badge>
                    <Badge variant='outline'>Outline</Badge>
                    <Badge variant='destructive'>Destructive</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Avatars Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatars</CardTitle>
                  <CardDescription>User profile pictures and fallbacks</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <Avatar className='h-12 w-12'>
                      <AvatarImage src='https://github.com/shadcn.png' />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback>XY</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Post Card */}
              <Card className='md:col-span-2 lg:col-span-3'>
                <CardHeader>
                  <div className='flex items-center space-x-4'>
                    <Avatar>
                      <AvatarImage src='https://github.com/shadcn.png' />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <CardTitle className='text-base'>Social Tippster</CardTitle>
                      <CardDescription>@socialtippster · 2h</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem>
                          <Settings className='mr-2 h-4 w-4' />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell className='mr-2 h-4 w-4' />
                          Notifications
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm'>
                    Just installed shadcn/ui components with the New York style and Zinc color
                    scheme! The dark mode support looks amazing 🌙✨
                  </p>
                </CardContent>
                <CardFooter className='justify-between'>
                  <div className='flex space-x-4'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleLike}
                      className={isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {likes}
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <MessageCircle className='mr-1 h-4 w-4' />
                      12
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <Share className='mr-1 h-4 w-4' />
                      Share
                    </Button>
                  </div>
                  <Button variant='ghost' size='sm'>
                    <Download className='mr-1 h-4 w-4' />
                    Save
                  </Button>
                </CardFooter>
              </Card>

              {/* Skeleton Loading Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Loading States</CardTitle>
                  <CardDescription>Skeleton components for loading</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <Skeleton className='h-12 w-12 rounded-full' />
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-[200px]' />
                      <Skeleton className='h-4 w-[160px]' />
                    </div>
                  </div>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='forms' className='space-y-6'>
            <Card className='max-w-md'>
              <CardHeader>
                <CardTitle>Sample Form</CardTitle>
                <CardDescription>Form components with validation</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' type='email' placeholder='Enter your email' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input id='password' type='password' placeholder='Enter your password' />
                </div>
              </CardContent>
              <CardFooter>
                <Button className='w-full'>Sign In</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value='layout' className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Separators</CardTitle>
                  <CardDescription>Divide content sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <p>Content above separator</p>
                    <Separator />
                    <p>Content below separator</p>
                    <div className='flex items-center space-x-4'>
                      <p>Left</p>
                      <Separator orientation='vertical' className='h-4' />
                      <p>Right</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dialog & Sheet</CardTitle>
                  <CardDescription>Modal and slide-out panels</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant='outline'>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Dialog Title</DialogTitle>
                        <DialogDescription>
                          This is a dialog component from shadcn/ui.
                        </DialogDescription>
                      </DialogHeader>
                      <p>Dialog content goes here.</p>
                    </DialogContent>
                  </Dialog>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant='outline'>Open Sheet</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Sheet Title</SheetTitle>
                        <SheetDescription>
                          This is a sheet component that slides from the side.
                        </SheetDescription>
                      </SheetHeader>
                      <p className='mt-4'>Sheet content goes here.</p>
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='navigation' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Navigation Examples</CardTitle>
                <CardDescription>Breadcrumbs and dropdown menus</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <h4 className='text-sm font-medium mb-2'>Breadcrumb Navigation</h4>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href='/'>Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href='/projects'>Projects</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>Project Alpha</BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div>
                  <h4 className='text-sm font-medium mb-2'>Dropdown Menu</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline'>
                        Menu <ChevronRight className='ml-2 h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <User className='mr-2 h-4 w-4' />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className='mr-2 h-4 w-4' />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className='mr-2 h-4 w-4' />
                        Favorites
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className='mt-12 text-center text-muted-foreground'>
          <p>shadcn/ui components installed successfully with New York style and Zinc theme</p>
          <p className='text-sm mt-2'>
            Toggle between light and dark modes using the theme switcher
          </p>
        </div>
      </div>
    </div>
  );
}
