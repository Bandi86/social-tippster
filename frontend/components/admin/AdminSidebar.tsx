'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  ShieldBan,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const AdminSidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const menuItems = [
    {
      title: 'Overview',
      url: '/admin',
      icon: Home,
      description: 'Dashboard overview',
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: Users,
      description: 'User management',
      badge: 'NEW',
    },
    {
      title: 'Posts',
      url: '/admin/posts',
      icon: FileText,
      description: 'Content management',
    },
    {
      title: 'Comments',
      url: '/admin/comments',
      icon: MessageSquare,
      description: 'Comment moderation',
    },
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: BarChart3,
      description: 'System analytics',
    },
  ];

  const moderationItems = [
    {
      title: 'Moderation',
      url: '/admin/moderation',
      icon: Shield,
      description: 'Content moderation',
    },
    {
      title: 'Banned Users',
      url: '/admin/banned',
      icon: ShieldBan,
      description: 'Banned user management',
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings,
      description: 'System settings',
    },
  ];

  return (
    <Sidebar className='bg-gray-900 border-r border-amber-500/20'>
      <SidebarHeader className='border-b border-amber-500/20 p-4'>
        <div className='flex items-center space-x-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600'>
            <Shield className='h-4 w-4 text-black' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold text-amber-100'>Admin Panel</span>
            <span className='text-xs text-amber-300/70'>Tippster</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-amber-300/70 text-xs font-medium uppercase tracking-wider'>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className='text-amber-100 hover:bg-amber-500/10 data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-300'
                  >
                    <Link href={item.url} className='flex items-center space-x-3'>
                      <item.icon className='h-4 w-4' />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge className='ml-auto bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xs'>
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className='text-amber-300/70 text-xs font-medium uppercase tracking-wider'>
            Moderation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moderationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className='text-amber-100 hover:bg-amber-500/10 data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-300'
                  >
                    <Link href={item.url} className='flex items-center space-x-3'>
                      <item.icon className='h-4 w-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-amber-500/20 p-4'>
        <div className='space-y-3'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600'>
              <span className='text-xs font-semibold text-black'>
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-amber-100 truncate'>
                {user?.username || 'Admin'}
              </p>
              <p className='text-xs text-amber-300/70'>Administrator</p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleLogout}
            className='w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300'
          >
            <LogOut className='h-4 w-4 mr-2' />
            Logout
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;
