'use client';
import LoginForm from '@/components/auth/login-form';
import RegisterFormNew from '@/components/auth/register-form-new';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Users, Shield, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

function AuthPageContent() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className='h-screen w-screen flex bg-slate-900 fixed inset-0 overflow-hidden'>
      {/* Marketing Panel - Left Side */}
      <div className='hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 relative overflow-hidden'>
        <div className='absolute inset-0 bg-black/20' />
        <div className='relative z-10 flex flex-col justify-center px-8 xl:px-12 text-white h-full overflow-y-auto'>
          {/* Back Button */}
          <Link
            href='/'
            className='absolute top-8 left-8 flex items-center text-white/80 hover:text-white transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Vissza a főoldalra
          </Link>

          {/* Main Content */}
          <div className='max-w-md'>
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-4'>Tippster FC</h1>
              <p className='text-xl text-white/90'>
                Csatlakozz Magyarország legnagyobb tippelő közösségéhez!
              </p>
            </div>

            {/* Features */}
            <div className='space-y-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4'>
                  <Users className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Aktív közösség</h3>
                  <p className='text-white/80 text-sm'>Több ezer aktív tippelő</p>
                </div>
              </div>

              <div className='flex items-center'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4'>
                  <TrendingUp className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Profi elemzések</h3>
                  <p className='text-white/80 text-sm'>Szakértői tippek és statisztikák</p>
                </div>
              </div>

              <div className='flex items-center'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4'>
                  <Star className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Ranglisták</h3>
                  <p className='text-white/80 text-sm'>Versenyezz a legjobbakkal</p>
                </div>
              </div>
            </div>

            <div className='mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm'>
              <p className='text-sm text-white/90'>
                "A legjobb tippelő platform amit valaha használtam. Fantasztikus közösség!"
              </p>
              <p className='text-xs text-white/70 mt-2'>- Kovács Péter, Top tippelő</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Forms - Right Side */}
      <div className='flex-1 lg:w-1/2 xl:w-3/5 flex flex-col h-full max-h-screen overflow-hidden'>
        {/* Mobile Back Button */}
        <div className='lg:hidden p-4 flex-shrink-0'>
          <Link
            href='/'
            className='flex items-center text-gray-400 hover:text-white transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Vissza
          </Link>
        </div>

        {/* Form Container */}
        <div className='flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 min-h-0 overflow-hidden'>
          <div className='w-full max-w-sm mx-auto'>
            {/* Tab Switcher */}
            <div className='mb-4'>
              <div className='flex bg-slate-800 rounded-lg p-1'>
                <button
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
                    activeTab === 'login'
                      ? 'bg-amber-500 text-black'
                      : 'text-gray-300 hover:text-white',
                  )}
                  onClick={() => setActiveTab('login')}
                >
                  Bejelentkezés
                </button>
                <button
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
                    activeTab === 'register'
                      ? 'bg-amber-500 text-black'
                      : 'text-gray-300 hover:text-white',
                  )}
                  onClick={() => setActiveTab('register')}
                >
                  Regisztráció
                </button>
              </div>
            </div>

            {/* Forms */}
            <div>
              <AnimatePresence mode='wait'>
                {activeTab === 'login' ? (
                  <motion.div
                    key='login'
                    variants={formVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                  >
                    <LoginForm onSuccess={() => setActiveTab('login')} />
                  </motion.div>
                ) : (
                  <motion.div
                    key='register'
                    variants={formVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                  >
                    <RegisterFormNew onSuccess={() => setActiveTab('login')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='p-3 text-center text-gray-400 text-xs flex-shrink-0'>
        <p>© 2025 Tippster FC. Minden jog fenntartva.</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen bg-slate-900 text-white'>
          Loading...
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
