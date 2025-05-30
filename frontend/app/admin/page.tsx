// ===============================
// Admin dashboard oldal - magyar kommentek, Zustand hookok, valós adatok
// ===============================

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';

import {
  AlertTriangle,
  Ban,
  BarChart,
  Settings,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

// Admin statisztika interfész (egységesen a store-ból)
interface AdminStats {
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
}

const AdminDashboardPage = () => {
  // Auth hook (felhasználó adatok)
  const { user } = useAuth();
  // Users hook (admin statisztikák és betöltési állapot)
  const { adminUserStats, isLoadingAdminStats, fetchAdminUserStats, error } = useUsers();

  // Statisztikák betöltése komponens mountkor
  useEffect(() => {
    fetchAdminUserStats();
  }, [fetchAdminUserStats]);

  // Admin funkciók kártyák (magyar szövegek)
  const adminCards = [
    {
      title: 'Felhasználók kezelése',
      description: 'Felhasználók, szerepkörök és jogosultságok kezelése',
      icon: Users,
      href: '/admin/users',
      color: 'from-amber-500 to-yellow-600',
    },
    {
      title: 'Rendszer beállítások',
      description: 'Globális rendszerbeállítások konfigurálása',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Statisztikák',
      description: 'Rendszerhasználat és statisztikák megtekintése',
      icon: BarChart,
      href: '/admin/analytics',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='space-y-8'>
        {/* Fejléc - magyar szövegek */}
        <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-amber-500/20 p-8 shadow-xl backdrop-blur-sm'>
          <div className='flex items-center space-x-6'>
            <div className='p-4 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-xl shadow-lg ring-2 ring-amber-400/20'>
              <Shield className='h-10 w-10 text-black' />
            </div>
            <div className='flex-1'>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-3'>
                Admin vezérlőpult
              </h1>
              <p className='text-xl text-white mb-2'>
                Üdv újra,{' '}
                <span className='text-amber-400 font-semibold'>
                  {user?.first_name || user?.username}!
                </span>
              </p>
              <p className='text-amber-300/80'>
                Rendelkezel adminisztrátori jogosultsággal a rendszer kezeléséhez.
              </p>
            </div>
          </div>

          <div className='mt-8 p-6 bg-gray-800/60 rounded-xl border border-amber-500/30 backdrop-blur-sm'>
            <h3 className='text-amber-400 font-semibold mb-4 flex items-center'>
              <UserCheck className='h-5 w-5 mr-2' />
              Adminisztrátor adatok
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-sm'>
              <div className='flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg'>
                <Shield className='h-4 w-4 text-amber-400' />
                <div>
                  <span className='text-amber-300 font-medium'>Szerepkör:</span>
                  <span className='text-white ml-2 capitalize'>{user?.role}</span>
                </div>
              </div>
              <div className='flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg'>
                <Users className='h-4 w-4 text-amber-400' />
                <div>
                  <span className='text-amber-300 font-medium'>Email:</span>
                  <span className='text-white ml-2'>{user?.email}</span>
                </div>
              </div>
              <div className='flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg'>
                <BarChart className='h-4 w-4 text-amber-400' />
                <div>
                  <span className='text-amber-300 font-medium'>Felhasználó ID:</span>
                  <span className='text-white ml-2 font-mono text-xs'>{user?.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin funkciók */}
        <div>
          <h2 className='text-3xl font-bold text-white mb-8 flex items-center'>
            <Settings className='h-8 w-8 text-amber-500 mr-3' />
            Admin funkciók
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {adminCards.map(card => {
              const Icon = card.icon;
              return (
                <Link key={card.title} href={card.href}>
                  <Card className='group bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer transform hover:scale-105'>
                    <CardHeader className='pb-4'>
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      >
                        <Icon className='h-8 w-8 text-white' />
                      </div>
                      <CardTitle className='text-white text-xl mb-2 group-hover:text-amber-400 transition-colors duration-200'>
                        {card.title}
                      </CardTitle>
                      <CardDescription className='text-gray-400 group-hover:text-gray-300 transition-colors duration-200'>
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Rendszerstatisztikák */}
        <div>
          <h2 className='text-2xl font-bold text-white mb-6'>Rendszerstatisztikák</h2>
          {isLoadingAdminStats ? (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className='bg-gray-900 border-amber-500/20'>
                  <CardContent className='p-6'>
                    <div className='text-center'>
                      <div className='h-8 w-16 bg-gray-700 rounded mx-auto mb-2 animate-pulse'></div>
                      <div className='h-4 w-20 bg-gray-700 rounded mx-auto animate-pulse'></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : adminUserStats ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-amber-500/20 hover:border-amber-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-amber-500 mb-2'>
                        {adminUserStats.total}
                      </div>
                      <div className='text-sm text-gray-400'>Összes felhasználó</div>
                    </div>
                    <div className='p-3 bg-amber-500/10 rounded-lg'>
                      <Users className='h-8 w-8 text-amber-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/20 hover:border-green-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-green-500 mb-2'>
                        {adminUserStats.active}
                      </div>
                      <div className='text-sm text-gray-400'>Aktív felhasználó</div>
                    </div>
                    <div className='p-3 bg-green-500/10 rounded-lg'>
                      <UserCheck className='h-8 w-8 text-green-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-blue-500 mb-2'>
                        {adminUserStats.admins}
                      </div>
                      <div className='text-sm text-gray-400'>Adminisztrátorok</div>
                    </div>
                    <div className='p-3 bg-blue-500/10 rounded-lg'>
                      <Shield className='h-8 w-8 text-blue-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/20 hover:border-red-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-red-500 mb-2'>
                        {adminUserStats.banned}
                      </div>
                      <div className='text-sm text-gray-400'>Kitiltott felhasználó</div>
                    </div>
                    <div className='p-3 bg-red-500/10 rounded-lg'>
                      <Ban className='h-8 w-8 text-red-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-yellow-500 mb-2'>
                        {adminUserStats.unverified}
                      </div>
                      <div className='text-sm text-gray-400'>Nem ellenőrzött</div>
                    </div>
                    <div className='p-3 bg-yellow-500/10 rounded-lg'>
                      <AlertTriangle className='h-8 w-8 text-yellow-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-3xl font-bold text-purple-500 mb-2'>
                        {adminUserStats.recentRegistrations}
                      </div>
                      <div className='text-sm text-gray-400'>Regisztrációk (hónap)</div>
                    </div>
                    <div className='p-3 bg-purple-500/10 rounded-lg'>
                      <TrendingUp className='h-8 w-8 text-purple-500' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : error ? (
            <div className='text-center py-12'>
              <AlertTriangle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
              <p className='text-gray-400'>Nem sikerült betölteni a statisztikákat: {error}</p>
            </div>
          ) : (
            <div className='text-center py-12'>
              <AlertTriangle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
              <p className='text-gray-400'>Nincsenek elérhető statisztikák.</p>
            </div>
          )}
          {/* TODO: További statisztikák, poszt és komment admin funkciók bővítése a jövőben */}
          <div className='mt-6 text-sm text-yellow-400'>
            {/* Hiányzó funkciók, jövőbeni fejlesztés */}
            <p>
              <b>Figyelem:</b> Egyes admin poszt, komment és moderációs funkciók még fejlesztés
              alatt állnak, vagy csak részben elérhetők. Ezeket a jövőben pótoljuk!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
