'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  followUser,
  formatJoinDate,
  getDisplayName,
  getUserAvatarUrl,
  unfollowUser,
  UserProfile,
} from '@/lib/api/users';
import {
  Calendar,
  DollarSign,
  Edit,
  Globe,
  MapPin,
  MessageCircle,
  Target,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface UserProfileCardProps {
  userProfile: UserProfile;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function UserProfileCard({ userProfile, onFollowChange }: UserProfileCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(userProfile.user.is_following || false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, stats } = userProfile;
  const isOwnProfile = currentUser?.id === user.id;
  const canEdit = isOwnProfile || currentUser?.role === ('ADMIN' as typeof user.role);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to follow users.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.id);
        setIsFollowing(false);
        toast({
          title: 'Unfollowed',
          description: `You are no longer following ${getDisplayName(user)}.`,
        });
      } else {
        await followUser(user.id);
        setIsFollowing(true);
        toast({
          title: 'Following',
          description: `You are now following ${getDisplayName(user)}.`,
        });
      }
      onFollowChange?.(isFollowing);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update follow status.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageUser = () => {
    // TODO: Implement messaging functionality
    toast({
      title: 'Coming Soon',
      description: 'Messaging feature will be available soon.',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Profile Header */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex flex-col sm:flex-row gap-6'>
            {/* Avatar */}
            <div className='flex-shrink-0'>
              <Avatar className='h-24 w-24 sm:h-32 sm:w-32'>
                <AvatarImage src={getUserAvatarUrl(user)} alt={getDisplayName(user)} />
                <AvatarFallback className='text-2xl'>
                  {getDisplayName(user)
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className='flex-1 space-y-3'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <h1 className='text-2xl font-bold'>{getDisplayName(user)}</h1>
                  {user.is_verified && (
                    <Badge variant='secondary' className='text-xs'>
                      Verified
                    </Badge>
                  )}
                  {user.role !== 'USER' && (
                    <Badge variant='outline' className='text-xs'>
                      {user.role}
                    </Badge>
                  )}
                </div>
                <p className='text-lg text-muted-foreground'>@{user.username}</p>
              </div>

              {/* Bio */}
              {user.bio && <p className='text-sm text-muted-foreground max-w-2xl'>{user.bio}</p>}

              {/* Location & Website */}
              <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
                {user.location && (
                  <div className='flex items-center gap-1'>
                    <MapPin className='h-4 w-4' />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <div className='flex items-center gap-1'>
                    <Globe className='h-4 w-4' />
                    <a
                      href={user.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:underline text-primary'
                    >
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  Joined {formatJoinDate(user.created_at)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2 pt-2'>
                {canEdit ? (
                  <Button asChild size='sm'>
                    <Link href={`/profile/edit`}>
                      <Edit className='h-4 w-4 mr-2' />
                      Edit Profile
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      disabled={isLoading}
                      size='sm'
                      variant={isFollowing ? 'outline' : 'default'}
                    >
                      {isFollowing ? (
                        <UserMinus className='h-4 w-4 mr-2' />
                      ) : (
                        <UserPlus className='h-4 w-4 mr-2' />
                      )}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button onClick={handleMessageUser} size='sm' variant='outline'>
                      <MessageCircle className='h-4 w-4 mr-2' />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        {/* Stats */}
        <CardContent className='pt-6'>
          <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4'>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground mb-1'>
                <Users className='h-4 w-4' />
              </div>
              <div className='text-2xl font-bold'>{stats.followers_count}</div>
              <div className='text-sm text-muted-foreground'>Followers</div>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground mb-1'>
                <Users className='h-4 w-4' />
              </div>
              <div className='text-2xl font-bold'>{stats.following_count}</div>
              <div className='text-sm text-muted-foreground'>Following</div>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground mb-1'>
                <MessageCircle className='h-4 w-4' />
              </div>
              <div className='text-2xl font-bold'>{stats.posts_count}</div>
              <div className='text-sm text-muted-foreground'>Posts</div>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground mb-1'>
                <Target className='h-4 w-4' />
              </div>
              <div className='text-2xl font-bold'>{stats.tips_count}</div>
              <div className='text-sm text-muted-foreground'>Tips</div>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground mb-1'>
                <TrendingUp className='h-4 w-4' />
              </div>
              <div className='text-2xl font-bold'>{stats.success_rate}%</div>
              <div className='text-sm text-muted-foreground'>Success Rate</div>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground mb-1'>
                <DollarSign className='h-4 w-4' />
              </div>
              <div className='text-2xl font-bold'>
                {stats.total_profit >= 0 ? '+' : ''}
                {stats.total_profit}
              </div>
              <div className='text-sm text-muted-foreground'>Profit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
