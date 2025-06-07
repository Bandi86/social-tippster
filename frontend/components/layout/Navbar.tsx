'use client';

import { NotificationsBell } from '@/components/features/notifications/NotificationsBell';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Home, Menu, MessageSquare, Star, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import UserNavbarMenu from './UserNavbarMenu';

const navigationItems = [
  { name: 'Főoldal', href: '/', icon: Home },
  { name: 'Tippek', href: '/posts', icon: TrendingUp },
  { name: 'Beszélgetések', href: '/discussions', icon: MessageSquare },
  { name: 'Hírek', href: '/news', icon: BookOpen },
  { name: 'Elemzések', href: '/analysis', icon: Star },
];

const UserNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const getActiveClass = (href: string) => {
    return pathname === href
      ? 'bg-amber-500/20 text-amber-100 border-amber-400/50'
      : 'text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 border-transparent hover:border-amber-500/30';
  };

  return (
    <nav className='bg-black border-b border-amber-500/20 shadow-lg backdrop-blur-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          {/* Logo */}
          <div className='flex-shrink-0 flex items-center'>
            <Link
              href='/'
              className='font-bold text-2xl text-transparent bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text hover:from-yellow-300 hover:to-amber-400 transition-all duration-300'
            >
              Tippster
            </Link>
          </div>

          {/* Desktop Navigation - Icon + Text */}
          <div className='hidden lg:flex items-center space-x-1'>
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium group border ${getActiveClass(item.href)}`}
                >
                  <Icon className='h-5 w-5 group-hover:scale-110 transition-transform' />
                  <span className='text-sm'>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Medium Screen Navigation - Icons Only */}
          <div className='hidden md:flex lg:hidden items-center space-x-1'>
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`p-3 rounded-lg transition-all duration-200 group border ${getActiveClass(item.href)}`}
                  title={item.name}
                >
                  <Icon className='h-5 w-5 group-hover:scale-110 transition-transform' />
                </Link>
              );
            })}
          </div>

          {/* Right Side - User Actions */}
          <div className='flex items-center space-x-3'>
            {/* Messages and Notifications - Only visible for authenticated users */}
            {user && (
              <div className='hidden md:flex items-center space-x-2'>
                {/* Messages Icon */}
                <Link
                  href='/messages'
                  className='relative p-2 text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 rounded-lg transition-all duration-200 group border border-transparent hover:border-amber-500/30'
                  title='Üzenetek'
                >
                  <MessageSquare className='h-5 w-5 group-hover:scale-110 transition-transform' />
                  <span className='absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg'>
                    2
                  </span>
                </Link>

                {/* Notifications Bell */}
                <NotificationsBell />
              </div>
            )}

            {/* User Menu or Auth Buttons */}
            <div className='hidden md:flex items-center'>
              {isLoading ? (
                <div className='h-10 w-24 bg-amber-500/20 animate-pulse rounded-lg' />
              ) : user ? (
                <UserNavbarMenu />
              ) : (
                <div className='flex space-x-2'>
                  <Link
                    href='/auth'
                    className='px-4 py-2 text-amber-300 hover:text-amber-100 border border-amber-500/50 hover:border-amber-400 rounded-lg transition-all duration-200 font-medium'
                  >
                    Belépés
                  </Link>
                  <Link
                    href='/auth'
                    className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 font-medium'
                  >
                    Regisztráció
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className='md:hidden flex items-center'>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className='text-amber-300 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-lg p-2 transition-all duration-200'
                aria-label='Menü megnyitása'
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className='md:hidden bg-black/95 backdrop-blur-sm border-t border-amber-500/20'>
          <div className='px-4 py-4 space-y-2'>
            {/* Navigation Items */}
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-100 border-l-4 border-amber-400'
                      : 'text-amber-300 hover:text-amber-100 hover:bg-amber-500/10'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className='h-5 w-5' />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className='ml-auto h-2 w-2 bg-amber-400 rounded-full animate-pulse' />
                  )}
                </Link>
              );
            })}

            {/* Mobile User Section */}
            <div className='pt-4 border-t border-amber-500/20'>
              {/* Mobile Messages and Notifications - Only for authenticated users */}
              {user && (
                <div className='flex justify-center gap-4 pb-4'>
                  {/* Mobile Messages Icon */}
                  <Link
                    href='/messages'
                    className='relative p-2 text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 rounded-lg transition-all duration-200 group border border-transparent hover:border-amber-500/30'
                    title='Üzenetek'
                    onClick={() => setMobileOpen(false)}
                  >
                    <MessageSquare className='h-5 w-5 group-hover:scale-110 transition-transform' />
                    <span className='absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg'>
                      2
                    </span>
                  </Link>

                  {/* Mobile Notifications Bell */}
                  <NotificationsBell />
                </div>
              )}

              {isLoading ? (
                <div className='h-12 w-full bg-amber-500/20 animate-pulse rounded-lg' />
              ) : user ? (
                <div className='flex justify-center pt-2'>
                  <UserNavbarMenu />
                </div>
              ) : (
                <div className='space-y-2'>
                  <Link
                    href='/auth'
                    className='block w-full text-center px-4 py-3 text-amber-300 border border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200 font-medium'
                    onClick={() => setMobileOpen(false)}
                  >
                    Belépés
                  </Link>
                  <Link
                    href='/auth'
                    className='block w-full text-center px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 font-medium'
                    onClick={() => setMobileOpen(false)}
                  >
                    Regisztráció
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;
