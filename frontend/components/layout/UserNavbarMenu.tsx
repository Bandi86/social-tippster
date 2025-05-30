'use client';

import { NotificationsBell } from '@/components/header/NotificationsBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Settings, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const UserNavbarMenu = () => {
  const { user, logout, hasAdminAccess, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className='flex items-center space-x-2'>
        <div className='h-10 w-10 rounded-full bg-amber-500/20 animate-pulse' />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials =
    user.first_name && user.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className='flex items-center gap-2'>
      <NotificationsBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='relative h-10 w-10 rounded-full hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-200'
          >
            <Avatar className='h-9 w-9'>
              <AvatarImage src={user.profile_image} alt={user.username} />
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
              <p className='text-sm font-medium leading-none text-amber-100'>
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </p>
              <p className='text-xs leading-none text-amber-300/70'>{user.email}</p>
              <div className='flex items-center space-x-1 pt-1'>
                <Badge variant='outline' className='text-xs border-amber-500/50 text-amber-300'>
                  {user.role}
                </Badge>
                {hasAdminAccess && (
                  <Badge className='text-xs bg-gradient-to-r from-amber-500 to-yellow-600 text-black'>
                    <Shield className='h-3 w-3 mr-1' />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-amber-500/20' />
          <DropdownMenuItem
            asChild
            className='text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-100'
          >
            <Link href='/profile'>
              <User className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className='text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-100'
          >
            <Link href='/dashboard'>
              <Settings className='mr-2 h-4 w-4' />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          {hasAdminAccess && (
            <>
              <DropdownMenuSeparator className='bg-amber-500/20' />
              <DropdownMenuItem
                asChild
                className='text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-100'
              >
                <Link href='/admin'>
                  <Shield className='mr-2 h-4 w-4' />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator className='bg-amber-500/20' />
          <DropdownMenuItem
            onClick={handleLogout}
            className='text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300'
          >
            <LogOut className='mr-2 h-4 w-4' />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserNavbarMenu;
