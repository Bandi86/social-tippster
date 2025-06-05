'use client';

import AuthCta from '@/components/shared/AuthCta';
import AuthenticatedPostCreation from '@/components/shared/AuthenticatedPostCreation';
import { useAuth } from '@/hooks/useAuth';
import { PostActionType } from '@/lib/post-creation-utils';
import { useCallback } from 'react';

interface PostCreationAreaProps {
  onCreatePost?: (type: PostActionType) => void;
  className?: string;
}

/**
 * Poszt létrehozási terület komponens
 * Bejelentkezett felhasználók számára poszt létrehozási felület
 * Vendég felhasználók számára regisztrációra ösztönző üzenet
 *
 * Most már Zustand auth store-t használ és moduláris komponensekre épül
 */
export default function PostCreationArea({ onCreatePost, className = '' }: PostCreationAreaProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  const handleCreatePost = useCallback(
    (type: PostActionType) => {
      if (onCreatePost) {
        onCreatePost(type);
      } else {
        // Default behavior - could navigate to post creation page
        console.log(`Creating ${type} post...`);
      }
    },
    [onCreatePost],
  );

  // Show loading state if auth is still initializing
  if (isLoading) {
    return <div className={`animate-pulse bg-gray-800 rounded-lg h-32 ${className}`} />;
  }

  // Show authenticated interface if user is logged in
  if (isAuthenticated && user) {
    return (
      <AuthenticatedPostCreation
        user={user}
        onCreatePost={handleCreatePost}
        className={className}
      />
    );
  }

  // Show CTA for unauthenticated users
  //return <AuthCta className={className} />;
}
