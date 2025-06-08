'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react';

interface UserProfileCardProps {
  user: {
    id: string;
    username: string;
    email?: string;
    profile_image?: string;
    bio?: string;
    location?: string;
    website?: string;
    created_at: string;
    reputation_score?: number;
    is_verified?: boolean;
    role?: string;
    posts_count?: number;
    comments_count?: number;
  };
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-4'>
          <Avatar className='h-16 w-16 ring-2 ring-amber-500/50'>
            <AvatarImage src={user.profile_image} alt={user.username} />
            <AvatarFallback className='bg-amber-600 text-white text-lg font-bold'>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <CardTitle className='text-xl text-white'>{user.username}</CardTitle>
              {user.is_verified && (
                <Badge variant='outline' className='text-blue-400 border-blue-400'>
                  Verified
                </Badge>
              )}
              {user.role === 'admin' && (
                <Badge variant='outline' className='text-amber-400 border-amber-400'>
                  Admin
                </Badge>
              )}
            </div>

            {user.bio && <p className='text-gray-300 text-sm mb-2'>{user.bio}</p>}

            <div className='flex items-center gap-4 text-sm text-gray-400'>
              <div className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>
                  Csatlakozott{' '}
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                    locale: hu,
                  })}
                </span>
              </div>

              {user.reputation_score && (
                <div className='flex items-center gap-1'>
                  <span className='font-semibold text-amber-400'>{user.reputation_score}</span>
                  <span>pont</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div className='text-center p-3 bg-gray-800/50 rounded-lg'>
            <div className='text-xl font-bold text-white'>{user.posts_count || 0}</div>
            <div className='text-sm text-gray-400'>Posztok</div>
          </div>

          <div className='text-center p-3 bg-gray-800/50 rounded-lg'>
            <div className='text-xl font-bold text-white'>{user.comments_count || 0}</div>
            <div className='text-sm text-gray-400'>Kommentek</div>
          </div>
        </div>

        {(user.location || user.website) && (
          <div className='space-y-2 text-sm'>
            {user.location && (
              <div className='flex items-center gap-2 text-gray-300'>
                <MapPin className='h-4 w-4' />
                <span>{user.location}</span>
              </div>
            )}

            {user.website && (
              <div className='flex items-center gap-2 text-gray-300'>
                <LinkIcon className='h-4 w-4' />
                <a
                  href={user.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-amber-400 transition-colors'
                >
                  {user.website}
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
