// Auth page with dynamic form switching
'use client';
import LoginForm from '@/components/auth/login-form';
import RegisterFormNew from '@/components/auth/register-form-new';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AuthPage() {
  const [form, setForm] = useState<'login' | 'register'>('login');

  // Left-side marketing content (from register-form-new)
  const MarketingContent = (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className='hidden lg:flex flex-col justify-center text-white space-y-8 p-12 h-full bg-black/40'
    >
      <div className='flex flex-col items-start space-y-4'>
        <span className='inline-block bg-yellow-400 text-black font-bold px-4 py-2 rounded-full shadow mb-2 text-sm tracking-widest uppercase animate-pulse'>
          Újdonság!
        </span>
        <h1 className='text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent leading-tight drop-shadow-lg animate-fade-in'>
          Tippster FC
        </h1>
        <p className='text-xl text-gray-200 leading-relaxed max-w-md drop-shadow animate-fade-in delay-200'>
          Csatlakozz Magyarország legnagyobb sportfogadó közösségéhez!
        </p>
      </div>
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
            <Shield className='w-5 h-5 text-black' />
          </div>
          <span className='text-base text-gray-300'>Biztonságos és megbízható platform</span>
        </div>
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
            <User className='w-5 h-5 text-black' />
          </div>
          <span className='text-base text-gray-300'>Több mint 50,000+ aktív tippelő</span>
        </div>
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
            <Mail className='w-5 h-5 text-black' />
          </div>
          <span className='text-base text-gray-300'>Napi tippek és elemzések</span>
        </div>
      </div>
      <div className='pt-6'>
        <div className='bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow animate-fade-in delay-300'>
          <p className='text-gray-300 italic text-base'>
            "Végre egy platform, ahol a sport szerelmesei találkozhatnak és tippelhetnek!"
          </p>
          <p className='text-yellow-400 font-semibold mt-2 text-sm'>- Péter, aktív tippelő</p>
        </div>
      </div>
    </motion.div>
  );

  // Right-side: dynamic form
  return (
    <div className='w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-stretch m-0 p-0'>
      {/* Home link */}
      <Link
        href='/'
        className='absolute top-6 left-6 z-30 flex items-center gap-2 text-white/80 hover:text-yellow-400 transition-colors'
      >
        <ArrowLeft size={18} />
        <span className='font-medium'>Vissza a főoldalra</span>
      </Link>

      {/* Enhanced background decorations */}
      <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000'></div>
        <div className='absolute top-1/3 left-1/2 w-[40rem] h-[40rem] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500'></div>
      </div>

      <div className='grid lg:grid-cols-[1fr_2fr] w-full h-full z-10'>
        {MarketingContent}

        <div className='w-full h-full flex items-center'>
          <div className='relative w-full h-full backdrop-blur-md bg-gradient-to-b from-black/30 to-purple-900/20 overflow-hidden shadow-[0_0_50px_rgba(128,0,255,0.15)] border-l border-white/10'>
            {/* Floating badge */}
            <div className='absolute top-10 left-1/2 -translate-x-1/2 z-20'>
              <span className='bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-3 rounded-full shadow-lg border-2 border-yellow-400/80 text-base drop-shadow-xl transform hover:scale-105 transition-transform'>
                {form === 'register' ? 'Regisztráció' : 'Bejelentkezés'}
              </span>
            </div>

            {/* Glowing top border */}
            <div className='w-full h-1 bg-gradient-to-r from-yellow-400/60 via-orange-500/60 to-yellow-400/60'></div>

            {/* Tab switcher - Single version */}
            <div className='flex justify-center gap-6 mt-24 mb-8 px-8 w-full max-w-md mx-auto'>
              <button
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-lg flex-1 ${
                  form === 'login'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-orange-500/20 scale-105'
                    : 'bg-white/5 text-white hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/10'
                }`}
                onClick={() => setForm('login')}
                aria-current={form === 'login'}
              >
                Bejelentkezés
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-lg flex-1 ${
                  form === 'register'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-orange-500/20 scale-105'
                    : 'bg-white/5 text-white hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/10'
                }`}
                onClick={() => setForm('register')}
                aria-current={form === 'register'}
              >
                Regisztráció
              </button>
            </div>

            {/* Dynamic form container with styled scrolling */}
            <div className='w-full px-12 py-6 max-h-[calc(100vh-170px)] overflow-y-auto'>
              <div className='relative w-full max-w-3xl mx-auto'>
                {/* Content slides with motion transition */}
                <motion.div
                  key={form}
                  initial={{ opacity: 0, x: form === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: form === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className='w-full'
                >
                  {form === 'register' ? (
                    <RegisterFormNew onSuccess={() => setForm('login')} />
                  ) : (
                    <LoginForm onRegisterClick={() => setForm('register')} />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Glowing bottom border */}
            <div className='w-full h-1 bg-gradient-to-r from-yellow-400/60 via-orange-500/60 to-yellow-400/60 absolute bottom-0'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
