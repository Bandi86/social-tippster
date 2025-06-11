'use client';

import { Bell, Home, Menu, MessageSquare, Search, TrendingUp, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Tips', href: '/tips', icon: TrendingUp },
  { name: 'Community', href: '/community', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <div className='flex items-center'>
          <Link href='/' className='flex items-center space-x-2 font-bold text-xl'>
            <div className='h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center'>
              <TrendingUp className='h-5 w-5 text-white' />
            </div>
            <span className='hidden sm:inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
              Social Tippster
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center space-x-6'>
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <Icon className='h-4 w-4' />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className='flex items-center space-x-4'>
          {/* Search - Desktop only */}
          <Button variant='outline' size='icon' className='hidden lg:flex'>
            <Search className='h-4 w-4' />
            <span className='sr-only'>Search</span>
          </Button>

          {/* Notifications */}
          <Button variant='outline' size='icon'>
            <Bell className='h-4 w-4' />
            <span className='sr-only'>Notifications</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile menu button */}
          <Button
            variant='outline'
            size='icon'
            className='md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 bg-background border-t'>
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className='h-5 w-5' />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Search */}
            <div className='px-3 py-2'>
              <Button variant='outline' className='w-full justify-start'>
                <Search className='h-4 w-4 mr-2' />
                Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
