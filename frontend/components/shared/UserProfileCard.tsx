// Refaktorált UserProfileCard - új moduláris komponenseket használ
// Refactored UserProfileCard - uses new modular components
'use client';

import { UserProfile } from '@/store/users';
import ProfileCard from '../features/profile/ProfileCard';

interface UserProfileCardProps {
  userProfile: UserProfile;
  onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * Refaktorált felhasználó profil kártya - moduláris komponenseket használ
 * Megtartja a kompatibilitást a meglévő kóddal
 *
 * @param userProfile - Felhasználó profil adatok
 * @param onFollowChange - Követési állapot változás callback
 */
export default function UserProfileCard({ userProfile, onFollowChange }: UserProfileCardProps) {
  return (
    <div className='space-y-6'>
      <ProfileCard userProfile={userProfile} onFollowChange={onFollowChange} />
    </div>
  );
}
