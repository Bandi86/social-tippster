// Profil kártya komponens - teljes profil kártya újrafelhasználható formátumban
// Profile card component - complete profile card in reusable format
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserProfile } from '@/lib/api/users';
import ProfileActions from './ProfileActions';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';

interface ProfileCardProps {
  userProfile: UserProfile;
  onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * Profil kártya komponens - teljes profil információk megjelenítése
 * Összerakja a fejlécet, statisztikákat és műveleteket egy komponensbe
 * Újrafelhasználható különböző oldalakon
 *
 * @param userProfile - Teljes felhasználó profil adatok
 * @param onFollowChange - Követési állapot változás callback
 */
export default function ProfileCard({ userProfile, onFollowChange }: ProfileCardProps) {
  const { user, stats } = userProfile;

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-4'>
        {/* Profil fejléc - Profile header */}
        <ProfileHeader user={user} />

        {/* Műveletek - Actions */}
        <ProfileActions
          user={user}
          isFollowing={user.is_following}
          onFollowChange={onFollowChange}
        />
      </CardHeader>

      <Separator />

      {/* Statisztikák - Statistics */}
      <CardContent className='pt-6'>
        <ProfileStats stats={stats} />
      </CardContent>
    </Card>
  );
}
