// Profil kártya komponens - teljes profil kártya újrafelhasználható formátumban
// Profile card component - complete profile card in reusable format
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserProfile } from '@/store/users';
import { User } from '@/types/index';
import ProfileActions from './ProfileActions';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';

interface ProfileCardProps {
  userProfile: UserProfile;
  onFollowChange?: (isFollowing: boolean) => void;
}

// Helper function to convert UserProfile.user to User type
const convertToUser = (userProfile: UserProfile): User => {
  const { user } = userProfile;

  // Create a User object with default values for missing properties
  return {
    ...user,
    // Add missing User properties with defaults
    badge_count: 0,
    ban_reason: undefined,
    banned_until: undefined,
    best_streak: 0,
    cover_image: undefined,
    current_streak: 0,
    date_of_birth: undefined,
    email_verified_at: undefined,
    favorite_team: undefined,
    featured_posts: 0,
    follower_count: userProfile.stats.followers_count,
    following_count: userProfile.stats.following_count,
    gender: undefined,
    highest_badge_tier: undefined,
    id: user.user_id,
    is_banned: false,
    language_preference: 'hu',
    last_login: undefined,
    login_count: 0,
    password_hash: '',
    phone_number: undefined,
    post_count: userProfile.stats.posts_count,
    premium_expiration: undefined,
    referred_by: undefined,
    referral_code: undefined,
    referral_count: 0,
    reputation_score: userProfile.stats.reputation_score,
    role: 'user' as User['role'],
    successful_tips: 0,
    tip_success_rate: 0,
    timezone: undefined,
    total_posts: userProfile.stats.posts_count,
    total_profit: 0,
    total_tips: 0,
    two_factor_enabled: false,
    updated_by: undefined,
  } as User;
};

/**
 * Profil kártya komponens - teljes profil információk megjelenítése
 * Összerakja a fejlécet, statisztikákat és műveleteket egy komponensbe
 * Újrafelhasználható különböző oldalakon
 *
 * @param userProfile - Teljes felhasználó profil adatok
 * @param onFollowChange - Követési állapot változás callback
 */
export default function ProfileCard({ userProfile, onFollowChange }: ProfileCardProps) {
  const { stats } = userProfile;
  const user = convertToUser(userProfile);

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-4'>
        {/* Profil fejléc - Profile header */}
        <ProfileHeader user={user} />

        {/* Műveletek - Actions */}
        <ProfileActions user={user} isFollowing={false} onFollowChange={onFollowChange} />
      </CardHeader>

      <Separator />

      {/* Statisztikák - Statistics */}
      <CardContent className='pt-6'>
        <ProfileStats stats={stats} />
      </CardContent>
    </Card>
  );
}
