'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  FileText,
  Home,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminMenuItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: Home,
    description: 'Admin dashboard overview',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users',
    badge: 'New',
  },
  {
    title: 'Posts',
    href: '/admin/posts',
    icon: FileText,
    description: 'Manage posts and content',
  },
  {
    title: 'Comments',
    href: '/admin/comments',
    icon: MessageSquare,
    description: 'Moderate comments',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Site analytics and statistics',
  },
  {
    title: 'Moderation',
    href: '/admin/moderation',
    icon: ShieldCheck,
    description: 'Content moderation tools',
  },
  {
    title: 'Banned Users',
    href: '/admin/banned-users',
    icon: UserX,
    description: 'View and manage banned users',
  },
];

const settingsItems = [
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Admin settings',
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className='space-y-4 py-4'>
        <div className='px-3 py-2'>
          <div className='flex items-center mb-2'>
            <ShieldCheck className='h-5 w-5 mr-2 text-primary' />
            <h2 className='text-lg font-semibold tracking-tight'>Admin Panel</h2>
          </div>
          <p className='text-sm text-muted-foreground'>Manage your Social Tippster platform</p>
        </div>

        <Separator />

        <div className='px-3'>
          <h3 className='mb-2 px-4 text-lg font-semibold tracking-tight'>Main</h3>
          <div className='space-y-1'>
            {adminMenuItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive && 'bg-secondary')}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className='mr-2 h-4 w-4' />
                    {item.title}
                    {item.badge && (
                      <Badge variant='secondary' className='ml-auto'>
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className='px-3'>
          <h3 className='mb-2 px-4 text-lg font-semibold tracking-tight'>System</h3>
          <div className='space-y-1'>
            {settingsItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive && 'bg-secondary')}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className='mr-2 h-4 w-4' />
                    {item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
