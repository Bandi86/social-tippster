'use client';

import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import UserNavbarMenu from './UserNavbarMenu';

const menuItems = [
  { name: 'Home', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'About', href: '#' },
];

const UserNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useAuth();

  return (
    <nav className='bg-black border-b border-amber-500/20 shadow-lg backdrop-blur-sm'>
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
          {/* Desktop Menu */}
          <div className='hidden md:flex space-x-8'>
            {menuItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className='text-amber-300 hover:text-amber-100 transition-colors duration-200 font-medium relative group'
              >
                {item.name}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 group-hover:w-full transition-all duration-300'></span>
              </Link>
            ))}
          </div>
          {/* Right Side Buttons */}
          <div className='hidden md:flex space-x-3 items-center'>
            {isLoading ? (
              <div className='h-10 w-24 bg-amber-500/20 animate-pulse rounded-lg' />
            ) : user ? (
              <UserNavbarMenu />
            ) : (
              <>
                <Link
                  href='/auth/register'
                  className='inline-block text-center border border-white text-white font-medium px-6 py-2 rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all duration-200'
                >
                  Register
                </Link>
                <Link
                  href='/auth/login'
                  className='inline-block text-center border border-white text-white font-medium px-6 py-2 rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all duration-200'
                >
                  Login
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className='text-amber-300 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-lg p-2 transition-all duration-200'
              aria-label='Toggle menu'
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className='md:hidden bg-black/95 backdrop-blur-sm border-t border-amber-500/20'>
          <div className='px-4 py-4 space-y-3'>
            {menuItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className='block text-amber-300 hover:text-amber-100 transition-colors duration-200 py-3 px-2 rounded-lg hover:bg-amber-500/10 font-medium'
              >
                {item.name}
              </Link>
            ))}
            <div className='pt-3 border-t border-amber-500/20'>
              {isLoading ? (
                <div className='h-10 w-full bg-amber-500/20 animate-pulse rounded-lg' />
              ) : user ? (
                <div className='flex justify-center'>
                  <UserNavbarMenu />
                </div>
              ) : (
                <div className='space-y-3'>
                  <Link
                    href='/auth/register'
                    className='block w-full text-center border border-white text-white font-medium py-3 rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all duration-200'
                  >
                    Register
                  </Link>
                  <Link
                    href='/auth/login'
                    className='block w-full text-center border border-white text-white font-medium py-3 rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all duration-200'
                  >
                    Login
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
