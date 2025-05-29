// Profil tabok komponens - profil tartalom navigáció (posztok, tippek, követők)
// Profile tabs component - profile content navigation (posts, tips, followers)
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, MessageCircle, Users } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showFollowTabs?: boolean; // Saját profil esetén láthatók a követő tabok
  counts?: {
    posts?: number;
    followers?: number;
    following?: number;
  }; // Opcionális számok megjelenítése
}

/**
 * Profil tabok komponens - navigáció a különböző profil tartalmak között
 * Dinamikus tab megjelenítés a profil típusa alapján, opcionális számokkal
 *
 * @param activeTab - Jelenleg aktív tab
 * @param onTabChange - Tab váltás callback
 * @param showFollowTabs - Követő/Követett tabok megjelenítése
 * @param counts - Opcionális számok megjelenítése (posztok, követők, követettek)
 */
export default function ProfileTabs({
  activeTab,
  onTabChange,
  showFollowTabs = false,
  counts,
}: ProfileTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className='text-white'>
      <TabsList
        className={`grid w-full ${
          showFollowTabs ? 'grid-cols-4' : 'grid-cols-3'
        } bg-gray-800 border-gray-700 rounded-md`}
      >
        {/* Posztok tab - Posts tab */}
        <TabsTrigger
          value='posts'
          className='flex items-center space-x-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-300 hover:text-amber-400'
        >
          <MessageCircle className='w-4 h-4' />
          <span>Posztok{counts?.posts !== undefined ? ` (${counts.posts})` : ''}</span>
        </TabsTrigger>

        {/* Tippek tab - Tips tab */}
        <TabsTrigger
          value='tips'
          className='flex items-center space-x-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-300 hover:text-amber-400'
        >
          <BarChart2 className='w-4 h-4' />
          <span>Tippek</span>
        </TabsTrigger>

        {/* Követő tabok megjelenítése feltételesen - Conditional display of follow tabs */}
        {showFollowTabs && (
          <>
            <TabsTrigger
              value='followers'
              className='flex items-center space-x-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-300 hover:text-amber-400'
            >
              <Users className='w-4 h-4' />
              <span>Követők{counts?.followers !== undefined ? ` (${counts.followers})` : ''}</span>
            </TabsTrigger>

            <TabsTrigger
              value='following'
              className='flex items-center space-x-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-300 hover:text-amber-400'
            >
              <Users className='w-4 h-4' />
              <span>
                Követettek{counts?.following !== undefined ? ` (${counts.following})` : ''}
              </span>
            </TabsTrigger>
          </>
        )}
      </TabsList>
    </Tabs>
  );
}
