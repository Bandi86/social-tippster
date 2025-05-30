import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, FileText, MessageSquare, Plus, Settings, Shield, UserPlus } from 'lucide-react';
import Link from 'next/link';

const AdminQuickActions = () => {
  const quickActions = [
    {
      label: 'Add New User',
      href: '/admin/users/new',
      icon: UserPlus,
      description: 'Create a new user account',
      color: 'text-green-400 hover:text-green-300',
    },
    {
      label: 'Create Post',
      href: '/admin/posts/new',
      icon: FileText,
      description: 'Add new content',
      color: 'text-blue-400 hover:text-blue-300',
    },
    {
      label: 'View Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Check platform statistics',
      color: 'text-purple-400 hover:text-purple-300',
    },
    {
      label: 'Moderation Queue',
      href: '/admin/moderation',
      icon: Shield,
      description: 'Review flagged content',
      color: 'text-orange-400 hover:text-orange-300',
    },
    {
      label: 'Manage Comments',
      href: '/admin/comments',
      icon: MessageSquare,
      description: 'Review and moderate comments',
      color: 'text-cyan-400 hover:text-cyan-300',
    },
    {
      label: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Configure platform settings',
      color: 'text-amber-400 hover:text-amber-300',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all'
        >
          <Plus className='h-4 w-4 mr-2' />
          <span className='hidden xl:inline'>Quick Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-64 bg-black/95 backdrop-blur-sm border border-amber-500/20 shadow-xl'
        align='end'
        forceMount
      >
        <DropdownMenuLabel className='text-amber-100 font-semibold p-3'>
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-amber-500/20' />

        {quickActions.map(action => (
          <DropdownMenuItem
            key={action.label}
            asChild
            className='cursor-pointer hover:bg-amber-500/5 p-0'
          >
            <Link href={action.href} className='flex items-start space-x-3 p-3 w-full'>
              <div className={`mt-0.5 ${action.color}`}>
                <action.icon className='h-4 w-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-amber-100'>{action.label}</p>
                <p className='text-xs text-amber-300/70 mt-0.5'>{action.description}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminQuickActions;
