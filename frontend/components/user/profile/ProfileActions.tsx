// Profil műveletek komponens - felhasználó műveletek kezelése (követés, szerkesztés, üzenet)
// Profile actions component - handling user actions (follow, edit, message)
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { followUser, getDisplayName, unfollowUser, User } from '@/lib/api/users';
import { Edit, Lock, Mail, MessageCircle, Settings, UserMinus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ProfileActionsProps {
  user: User;
  isFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * Profil műveletek komponens - kezeli a felhasználói interakciókat
 * Saját profil esetén szerkesztési lehetőségek, mások esetén követés/üzenet
 *
 * @param user - Felhasználó adatok
 * @param isFollowing - Követési állapot
 * @param onFollowChange - Követési állapot változás callback
 */
export default function ProfileActions({
  user,
  isFollowing = false,
  onFollowChange,
}: ProfileActionsProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [followingState, setFollowingState] = useState(isFollowing);

  // Saját profil ellenőrzése - Check if own profile
  const isOwnProfile = currentUser?.id === user.id;
  const canEdit = isOwnProfile;

  // Követés állapot váltása - Toggle follow state
  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({
        title: 'Hitelesítés szükséges',
        description: 'A felhasználók követéséhez kérjük, jelentkezzen be.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      let newFollowState: boolean;
      if (followingState) {
        await unfollowUser(user.id);
        setFollowingState(false);
        newFollowState = false;
        toast({
          title: 'Követés visszavonva',
          description: `Már nem követed: ${getDisplayName(user)}.`,
        });
      } else {
        await followUser(user.id);
        setFollowingState(true);
        newFollowState = true;
        toast({
          title: 'Követve',
          description: `Mostantól követed: ${getDisplayName(user)}.`,
        });
      }
      onFollowChange?.(newFollowState);
    } catch (error) {
      toast({
        title: 'Hiba',
        description:
          error instanceof Error ? error.message : 'A követési állapot frissítése sikertelen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Üzenet küldés kezelése - Handle messaging
  const handleMessageUser = () => {
    toast({
      title: 'Hamarosan',
      description: 'Az üzenetküldési funkció hamarosan elérhető lesz.',
    });
  };

  return (
    <div className='flex gap-2 pt-2 flex-wrap'>
      {canEdit ? (
        // Saját profil esetén profil kezelési gombok - Profile management buttons for own profile
        <>
          <Button asChild size='sm' className='bg-amber-600 hover:bg-amber-700 text-white'>
            <Link href={`/profile/edit`}>
              <Edit className='h-4 w-4 mr-2' />
              Profil szerkesztése
            </Link>
          </Button>
          <Button
            asChild
            size='sm'
            variant='outline'
            className='border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
          >
            <Link href={`/profile/settings`}>
              <Settings className='h-4 w-4 mr-2' />
              Beállítások
            </Link>
          </Button>
          <Button
            asChild
            size='sm'
            variant='outline'
            className='border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
          >
            <Link href={`/profile/change-password`}>
              <Lock className='h-4 w-4 mr-2' />
              Jelszó módosítása
            </Link>
          </Button>
          <Button
            asChild
            size='sm'
            variant='outline'
            className='border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
          >
            <Link href={`/profile/change-email`}>
              <Mail className='h-4 w-4 mr-2' />
              Email módosítása
            </Link>
          </Button>
        </>
      ) : (
        // Mások profilja esetén követés és üzenet gombok - Follow and message buttons for others
        <>
          {!isOwnProfile && (
            <Button
              onClick={handleFollowToggle}
              disabled={isLoading}
              size='sm'
              variant={followingState ? 'outline' : 'default'}
              className={
                followingState
                  ? 'border-amber-600 text-amber-400 hover:bg-amber-900/20 hover:text-amber-300'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }
            >
              {followingState ? (
                <UserMinus className='h-4 w-4 mr-2' />
              ) : (
                <UserPlus className='h-4 w-4 mr-2' />
              )}
              {followingState ? 'Követés visszavonása' : 'Követés'}
            </Button>
          )}
          <Button
            onClick={handleMessageUser}
            size='sm'
            variant='outline'
            className='border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
          >
            <MessageCircle className='h-4 w-4 mr-2' />
            Üzenet
          </Button>
        </>
      )}
    </div>
  );
}
