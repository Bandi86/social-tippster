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
import { ImageIcon, Type, Zap } from 'lucide-react';
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
    <Card
      className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600 transition-colors ${className}`}
    >
      <CardContent className='p-4'>
        <div className='flex items-center gap-4 mb-4'>
          <Avatar className='h-10 w-10 ring-2 ring-amber-600/20'>
            <AvatarImage src={user.profile_image} alt={user.username} />
            <AvatarFallback className='bg-amber-600 text-white'>
              {getAvatarFallback(user.username || 'User')}
            </AvatarFallback>
          </Avatar>

          <Button
            onClick={handleCreatePost}
            variant='outline'
            disabled={disabled}
            className='flex-1 justify-start text-gray-400 border-gray-600 hover:border-amber-600 hover:bg-gray-800 hover:text-white transition-all disabled:opacity-50 h-12'
          >
            <div className='flex items-center gap-2'>
              <Type className='h-4 w-4' />
              {getDefaultPlaceholder()}
            </div>
          </Button>
        </div>

        {/* Feature highlights */}
        <div className='flex items-center justify-between text-xs text-gray-400 mb-3'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <ImageIcon className='h-3 w-3' />
              <span>Kép feltöltés</span>
            </div>
            <div className='flex items-center gap-1'>
              <Zap className='h-3 w-3' />
              <span>Gyors szerkesztés</span>
            </div>
          </div>
          <span className='text-amber-400'>✨ Új funkciók</span>
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
