'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Bell, Home, LogOut, Menu, Settings, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Admin Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-16 items-center'>
          {/* Mobile Sidebar Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                className='mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden'
              >
                <Menu className='h-6 w-6' />
                <span className='sr-only'>Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='pr-0'>
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          {/* Logo & Title */}
          <div className='flex items-center space-x-2'>
            <ShieldCheck className='h-6 w-6 text-primary' />
            <span className='font-bold text-xl'>Admin Panel</span>
            <Badge variant='secondary' className='text-xs'>
              v1.0
            </Badge>
          </div>

          {/* Navigation Breadcrumb */}
          <nav className='ml-8 hidden md:flex items-center space-x-2 text-sm'>
            <Link
              href='/admin'
              className={cn(
                'hover:text-foreground transition-colors',
                pathname === '/admin' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              Dashboard
            </Link>
            {pathname !== '/admin' && (
              <>
                <span className='text-muted-foreground'>/</span>
                <span className='text-foreground font-medium'>
                  {pathname
                    .split('/')
                    .pop()
                    ?.replace('-', ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </>
            )}
          </nav>

          <div className='ml-auto flex items-center space-x-4'>
            {/* Quick Actions */}
            <div className='hidden md:flex items-center space-x-2'>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/dashboard'>
                  <Home className='h-4 w-4 mr-2' />
                  View Site
                </Link>
              </Button>
            </div>

            {/* Notifications */}
            <Button variant='ghost' size='sm'>
              <Bell className='h-4 w-4' />
              <span className='sr-only'>Notifications</span>
            </Button>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                    {user?.name?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      'A'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>{user?.name || 'Admin User'}</p>
                    <p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
                    <Badge variant='outline' className='w-fit'>
                      Admin
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/profile'>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/admin/settings'>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Desktop Sidebar */}
        <aside className='hidden md:flex w-64 flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-background'>
          <AdminSidebar />
        </aside>

        {/* Main Content */}
        <main className='flex-1 md:ml-64'>
          <div className='container mx-auto p-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
