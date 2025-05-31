/**
 * Bejelentkezett felhasználók poszt létrehozási felülete
 * Authenticated user post creation interface
 */

import PostActionButtons from '@/components/shared/PostActionButtons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDefaultPlaceholder, PostActionType } from '@/lib/post-creation-utils';
import { getAvatarFallback } from '@/lib/ui-utils';
import { User } from '@/types';
import { useState } from 'react';

interface AuthenticatedPostCreationProps {
  user: User;
  onCreatePost: (type: PostActionType) => void;
  disabled?: boolean;
  className?: string;
}

export default function AuthenticatedPostCreation({
  user,
  onCreatePost,
  disabled = false,
  className = '',
}: AuthenticatedPostCreationProps) {
  const [selectedAction, setSelectedAction] = useState<PostActionType>('post');

  const handleCreatePost = () => {
    onCreatePost(selectedAction);
  };

  const handleActionSelect = (action: PostActionType) => {
    setSelectedAction(action);
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 ${className}`}>
      <CardContent className='p-4'>
        <div className='flex items-center gap-4 mb-4'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user.profile_image} alt={user.username} />
            <AvatarFallback className='bg-amber-600 text-white'>
              {getAvatarFallback(user.username || 'User')}
            </AvatarFallback>
          </Avatar>

          <Button
            onClick={handleCreatePost}
            variant='outline'
            disabled={disabled}
            className='flex-1 justify-start text-gray-400 border-gray-600 hover:border-amber-600 hover:bg-gray-800 disabled:opacity-50'
          >
            {getDefaultPlaceholder()}
          </Button>
        </div>

        <PostActionButtons
          selectedAction={selectedAction}
          onActionSelect={handleActionSelect}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
