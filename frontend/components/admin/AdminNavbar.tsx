'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { ChevronRight, LogOut, Search, Settings, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminNotifications from './AdminNotifications';
import AdminQuickActions from './AdminQuickActions';
import AdminSystemStatus from './AdminSystemStatus';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];

    // Add home breadcrumb
    breadcrumbs.push({
      label: 'Admin',
      href: '/admin',
      isActive: pathname === '/admin',
    });

    // Add path segments
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const href = '/' + pathSegments.slice(0, i + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      const isActive = href === pathname;

      breadcrumbs.push({
        label,
        href,
        isActive,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const userInitials =
    user?.first_name && user?.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <header className='sticky top-0 z-50 w-full border-b border-amber-500/20 bg-black/95 backdrop-blur-md shadow-lg'>
      <div className='flex h-16 items-center gap-4 px-4 md:px-6'>
        {/* Sidebar Trigger */}
        <SidebarTrigger className='text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors duration-200' />

        {/* Breadcrumbs */}
        <div className='flex-1'>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className='flex items-center'>
                  <BreadcrumbItem>
                    {crumb.isActive ? (
                      <BreadcrumbPage className='text-amber-200 font-medium'>
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={crumb.href}
                        className='text-amber-400/80 hover:text-amber-300 transition-colors'
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className='h-4 w-4 text-amber-500/60' />
                    </BreadcrumbSeparator>
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search Bar */}
        <div className='hidden md:flex relative w-64 lg:w-80'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400/60' />
          <Input
            placeholder='Search users, posts, analytics...'
            className='pl-10 bg-gray-900/50 border-amber-500/30 text-amber-100 placeholder:text-amber-400/40 focus:border-amber-400/60 focus:ring-amber-400/20 transition-all'
          />
        </div>

        {/* Mobile Search Button */}
        <Button
          variant='ghost'
          size='sm'
          className='md:hidden text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all'
        >
          <Search className='h-5 w-5' />
        </Button>

        {/* System Status */}
        <AdminSystemStatus />

        {/* Quick Actions */}
        <div className='hidden lg:flex items-center'>
          <AdminQuickActions />
        </div>

        {/* Notifications */}
        <AdminNotifications />

        {/* Admin User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='relative h-10 w-10 rounded-full hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-200'
            >
              <Avatar className='h-9 w-9'>
                <AvatarImage src={user?.profile_image} alt={user?.username} />
                <AvatarFallback className='bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-semibold'>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-64 bg-black/95 backdrop-blur-sm border border-amber-500/20 shadow-xl'
            align='end'
            forceMount
          >
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <div className='flex items-center space-x-2'>
                  <Shield className='h-4 w-4 text-amber-400' />
                  <p className='text-sm font-medium leading-none text-amber-100'>
                    {user?.username || 'Admin User'}
                  </p>
                </div>
                <p className='text-xs leading-none text-amber-400/80'>
                  {user?.email || 'admin@example.com'}
                </p>
                <Badge className='w-fit bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs px-2 py-0.5'>
                  Administrator
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-amber-500/20' />
            <DropdownMenuItem asChild className='cursor-pointer hover:bg-amber-500/10'>
              <Link href='/admin/profile' className='flex items-center space-x-2'>
                <User className='h-4 w-4 text-amber-400' />
                <span className='text-amber-100'>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='cursor-pointer hover:bg-amber-500/10'>
              <Link href='/admin/settings' className='flex items-center space-x-2'>
                <Settings className='h-4 w-4 text-amber-400' />
                <span className='text-amber-100'>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className='bg-amber-500/20' />
            <DropdownMenuItem asChild className='cursor-pointer hover:bg-amber-500/10'>
              <Link href='/' className='flex items-center space-x-2'>
                <User className='h-4 w-4 text-blue-400' />
                <span className='text-amber-100'>Switch to User View</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className='bg-amber-500/20' />
            <DropdownMenuItem
              onClick={handleLogout}
              className='cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10'
            >
              <div className='flex items-center space-x-2'>
                <LogOut className='h-4 w-4 text-red-400' />
                <span className='text-red-400'>Log out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminNavbar;
