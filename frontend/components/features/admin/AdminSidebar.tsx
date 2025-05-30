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
      shortcut: '⌘1',
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: Users,
      description: 'User management',
      badge: 'NEW',
      shortcut: '⌘2',
    },
    {
      title: 'Posts',
      url: '/admin/posts',
      icon: FileText,
      description: 'Content management',
      shortcut: '⌘3',
    },
    {
      title: 'Comments',
      url: '/admin/comments',
      icon: MessageSquare,
      description: 'Comment moderation',
      shortcut: '⌘4',
    },
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: BarChart3,
      description: 'System analytics',
      shortcut: '⌘5',
    },
  ];

  const moderationItems = [
    {
      title: 'Moderation',
      url: '/admin/moderation',
      icon: Shield,
      description: 'Content moderation',
      shortcut: '⌘M',
    },
    {
      title: 'Banned Users',
      url: '/admin/banned',
      icon: ShieldBan,
      description: 'Banned user management',
      shortcut: '⌘B',
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings,
      description: 'System settings',
      shortcut: '⌘S',
    },
  ];

  return (
    <Sidebar className='bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r border-amber-500/30 flex flex-col h-full shadow-2xl'>
      <SidebarHeader className='border-b border-amber-500/30 p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50'>
        <div className='flex items-center space-x-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg ring-2 ring-amber-400/20'>
            <Shield className='h-7 w-7 text-gray-900' />
          </div>
          <div className='flex flex-col'>
            <span className='text-xl font-bold text-amber-100'>Admin Panel</span>
            <span className='text-xs text-amber-300/80 font-medium'>Social Tippster</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='flex-grow overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-gray-900/20'>
        <SidebarGroup>
          <SidebarGroupLabel className='text-amber-400/90 text-sm font-semibold uppercase tracking-widest px-3 py-2 flex items-center space-x-2'>
            <div className='h-1 w-1 rounded-full bg-amber-400'></div>
            <span>Management</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className='mt-3 space-y-1'>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className='text-amber-100 hover:bg-gray-700/60 data-[active=true]:bg-gradient-to-r data-[active=true]:from-amber-600/40 data-[active=true]:to-amber-500/20 data-[active=true]:text-amber-50 data-[active=true]:shadow-lg rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-md border border-transparent hover:border-amber-500/20'
                  >
                    <Link
                      href={item.url}
                      className='flex items-center justify-between w-full px-4 py-3 group'
                    >
                      <div className='flex items-center space-x-3'>
                        <item.icon className='h-5 w-5 transition-transform group-hover:scale-110' />
                        <span className='font-medium'>{item.title}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {item.badge && (
                          <Badge className='bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 text-xs px-2.5 py-0.5 rounded-full shadow-sm font-semibold animate-pulse'>
                            {item.badge}
                          </Badge>
                        )}
                        {item.shortcut && (
                          <span className='text-xs text-amber-400/60 font-mono bg-gray-800/60 px-2 py-1 rounded-md border border-amber-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm'>
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className='text-amber-400/90 text-sm font-semibold uppercase tracking-widest px-3 py-2 flex items-center space-x-2'>
            <div className='h-1 w-1 rounded-full bg-amber-400'></div>
            <span>Moderation & Settings</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className='mt-3 space-y-1'>
            <SidebarMenu>
              {moderationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className='text-amber-100 hover:bg-gray-700/60 data-[active=true]:bg-gradient-to-r data-[active=true]:from-amber-600/40 data-[active=true]:to-amber-500/20 data-[active=true]:text-amber-50 data-[active=true]:shadow-lg rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-md border border-transparent hover:border-amber-500/20'
                  >
                    <Link
                      href={item.url}
                      className='flex items-center justify-between w-full px-4 py-3 group'
                    >
                      <div className='flex items-center space-x-3'>
                        <item.icon className='h-5 w-5 transition-transform group-hover:scale-110' />
                        <span className='font-medium'>{item.title}</span>
                      </div>
                      {item.shortcut && (
                        <span className='text-xs text-amber-400/60 font-mono bg-gray-800/60 px-2 py-1 rounded-md border border-amber-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm'>
                          {item.shortcut}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-amber-500/30 p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50'>
        <div className='space-y-4'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg ring-2 ring-amber-400/20'>
              <span className='text-lg font-bold text-gray-900'>
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-amber-100 truncate'>
                {user?.username || 'Admin User'}
              </p>
              <p className='text-xs text-amber-300/80 font-medium'>Administrator</p>
            </div>
          </div>
          <Button
            variant='outline'
            size='lg'
            onClick={handleLogout}
            className='w-full justify-center text-red-400 hover:bg-red-600/20 hover:text-red-300 border-red-500/50 hover:border-red-500/80 transition-all duration-200 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-md'
          >
            <LogOut className='h-5 w-5 mr-2.5' />
            <span className='font-medium'>Logout</span>
          </Button>
        </div>
      </SidebarFooter>

      {/* Enable sidebar rail for better UX */}
      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;
