// Profil fejléc komponens - felhasználó alapvető adatainak megjelenítése
// Profile header component - displaying user's basic information
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getDisplayName, getUserAvatarUrl, User } from '@/lib/api/users';
import { Calendar, Circle, Clock, Globe, Mail, MapPin, Star } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
}

/**
 * Profil fejléc komponens - megjeleníti a felhasználó alapvető információit
 * Használható több oldalon keresztül, újrafelhasználható
 *
 * @param user - Felhasználó adatok
 */
export default function ProfileHeader({ user }: ProfileHeaderProps) {
  // Csatlakozási dátum formázása magyar formátumban
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Utolsó bejelentkezés formázása
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Soha nem jelentkezett be';

    const date = new Date(dateString);
    const now = new Date();

    // Ellenőrizzük, hogy érvényes dátum-e
    if (isNaN(date.getTime())) {
      return 'Érvénytelen dátum';
    }

    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Ha negatív a különbség, akkor jövőbeli dátum (hibás adat)
    if (diffInMinutes < 0) {
      return 'Jövőbeli dátum (hibás adat)';
    }

    // Online állapot (5 percen belül)
    if (diffInMinutes < 5) return 'Most aktív';

    // Percek (60 percen belül)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} perce`;
    }

    // Órák (24 órán belül)
    if (diffInHours < 24) {
      return `${diffInHours} órája`;
    }

    // Napok (7 napon belül)
    if (diffInDays < 7) {
      return `${diffInDays} napja`;
    }

    // Hetek (30 napon belül)
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} hete`;
    }

    // Hónapok (365 napon belül)
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} hónapja`;
    }

    // Évek
    const years = Math.floor(diffInDays / 365);
    return `${years} éve`;
  };

  // Online állapot ellenőrzése (5 percen belüli aktivitás = online)
  const isOnline = user.last_login
    ? new Date().getTime() - new Date(user.last_login).getTime() < 5 * 60 * 1000
    : false;

  // Pontos online állapot szöveg
  const getOnlineStatusText = () => {
    if (!user.last_login) return 'Soha nem volt online';

    const lastLoginTime = new Date(user.last_login);
    if (isNaN(lastLoginTime.getTime())) return 'Ismeretlen';

    return isOnline ? 'Online most' : 'Offline';
  };

  return (
    <div className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Bal oldal - Profilkép és kedvenc csapat */}
        <div className='flex flex-col items-center space-y-6'>
          {/* Profilkép - Avatar */}
          <div className='relative'>
            <Avatar className='h-32 w-32 sm:h-40 sm:w-40 border-4 border-gray-600 shadow-xl'>
              <AvatarImage src={getUserAvatarUrl(user)} alt={getDisplayName(user)} />
              <AvatarFallback className='text-3xl bg-gradient-to-br from-gray-700 to-gray-800 text-white'>
                {getDisplayName(user)
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Online állapot indicator */}
            <div className='absolute -bottom-2 -right-2'>
              <div
                className={`w-6 h-6 rounded-full border-4 border-gray-800 ${
                  isOnline ? 'bg-green-500' : user.last_login ? 'bg-red-500' : 'bg-gray-500'
                } shadow-lg`}
              >
                <div
                  className={`w-full h-full rounded-full ${
                    isOnline
                      ? 'bg-green-400 animate-pulse'
                      : user.last_login
                        ? 'bg-red-400'
                        : 'bg-gray-400'
                  }`}
                ></div>
              </div>
            </div>
          </div>

          {/* Kedvenc csapat szekció - Favorite Team Section */}
          <div className='bg-gray-800 rounded-lg p-4 w-full max-w-xs border border-gray-600'>
            <div className='flex items-center gap-2 mb-3'>
              <Star className='h-5 w-5 text-yellow-500' />
              <h3 className='text-sm font-semibold text-white'>Kedvenc Csapat</h3>
            </div>

            {/* Placeholder for team logo and info */}
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600'>
                <span className='text-xs text-gray-400'>Logo</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm text-gray-400'>Nincs kiválasztva</p>
                <Badge variant='outline' className='text-xs mt-1 border-gray-600 text-gray-500'>
                  Beállítás később
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Jobb oldal - Felhasználó információk */}
        <div className='flex-1 space-y-6'>
          {/* Fejléc szekció - Header Section */}
          <div className='space-y-4'>
            {/* Név és jelvények */}
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-bold text-white'>{getDisplayName(user)}</h1>
                {user.is_verified && (
                  <Badge className='bg-blue-600 hover:bg-blue-700 text-white border-blue-500'>
                    ✓ Ellenőrzött
                  </Badge>
                )}
              </div>

              {/* Felhasználónév és online állapot */}
              <div className='flex items-center gap-3'>
                <p className='text-xl text-gray-300'>@{user.username}</p>
                <div className='flex items-center gap-2'>
                  <Circle
                    className={`h-3 w-3 ${
                      isOnline
                        ? 'text-green-500 fill-current'
                        : user.last_login
                          ? 'text-red-500 fill-current'
                          : 'text-gray-500 fill-current'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isOnline
                        ? 'text-green-400'
                        : user.last_login
                          ? 'text-red-400'
                          : 'text-gray-400'
                    }`}
                  >
                    {getOnlineStatusText()}
                  </span>
                </div>
              </div>
            </div>

            {/* Teljes név és szerepkör */}
            <div className='flex flex-wrap gap-2'>
              {(user.first_name || user.last_name) && (
                <Badge variant='outline' className='border-gray-500 text-gray-300 bg-gray-800'>
                  <span className='font-medium'>Név:</span> {user.first_name} {user.last_name}
                </Badge>
              )}
              <Badge variant='outline' className='border-amber-500 text-amber-400 bg-amber-500/10'>
                <span className='font-medium'>Jogosultság:</span> {user.role}
              </Badge>
            </div>
          </div>

          {/* Bemutatkozás */}
          {user.bio && (
            <div className='bg-gray-800 rounded-lg p-4 border border-gray-600'>
              <h3 className='text-sm font-semibold text-white mb-2'>Bemutatkozás</h3>
              <p className='text-sm text-gray-300 leading-relaxed'>{user.bio}</p>
            </div>
          )}

          {/* Kapcsolat és adatok szekció */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Email információ */}
            <div className='bg-gray-800 rounded-lg p-4 border border-gray-600'>
              <div className='flex items-center gap-2 mb-2'>
                <Mail className='h-4 w-4 text-blue-400' />
                <span className='text-sm font-medium text-white'>Email</span>
              </div>
              <p className='text-sm text-gray-300'>{user.email}</p>
              {user.is_verified && (
                <Badge className='mt-2 bg-green-600 text-white text-xs'>✓ Ellenőrzött email</Badge>
              )}
            </div>

            {/* Regisztráció dátuma */}
            <div className='bg-gray-800 rounded-lg p-4 border border-gray-600'>
              <div className='flex items-center gap-2 mb-2'>
                <Calendar className='h-4 w-4 text-purple-400' />
                <span className='text-sm font-medium text-white'>Csatlakozás</span>
              </div>
              <p className='text-sm text-gray-300'>{formatJoinDate(user.created_at)}</p>
            </div>

            {/* Utolsó aktivitás - Improved */}
            <div className='bg-gray-800 rounded-lg p-4 border border-gray-600'>
              <div className='flex items-center gap-2 mb-2'>
                <Clock
                  className={`h-4 w-4 ${
                    isOnline
                      ? 'text-green-400'
                      : user.last_login
                        ? 'text-orange-400'
                        : 'text-gray-400'
                  }`}
                />
                <span className='text-sm font-medium text-white'>Utolsó aktivitás</span>
              </div>
              <p
                className={`text-sm ${
                  isOnline ? 'text-green-300' : user.last_login ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {formatLastLogin(user.last_login)}
              </p>
              {/* Pontos időpont tooltip-szerű megjelenítés */}
              {user.last_login && !isOnline && (
                <p className='text-xs text-gray-500 mt-1'>
                  Pontos idő: {new Date(user.last_login).toLocaleString('hu-HU')}
                </p>
              )}
            </div>

            {/* Lokáció és weboldal */}
            {(user.location || user.website) && (
              <div className='bg-gray-800 rounded-lg p-4 border border-gray-600'>
                <div className='space-y-3'>
                  {user.location && (
                    <div className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4 text-red-400' />
                      <span className='text-sm text-gray-300'>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className='flex items-center gap-2'>
                      <Globe className='h-4 w-4 text-blue-400' />
                      <a
                        href={user.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors'
                      >
                        {user.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
