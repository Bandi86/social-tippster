'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/store/posts';

import PostCard from './PostCard';
import PostListEmptyState from './list/PostListEmptyState';
import PostListFilters from './list/PostListFilters';
import PostListLoadMore from './list/PostListLoadMore';
import PostListSkeleton from './list/PostListSkeleton';

export interface PostListProps {
  posts: Post[];
  onPostUpdate: (updatedPost: Post) => void;
  onPostDelete: (postId: string) => void;
}

interface Props {
  initialPosts?: Post[];
  showCreateButton?: boolean;
  showFilters?: boolean;
  authorFilter?: string;
  typeFilter?: string;
  featuredOnly?: boolean;
  compact?: boolean;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: (postId: string) => void;
}

export default function PostList({
  initialPosts,
  showCreateButton = true,
  showFilters = true,
  authorFilter,
  typeFilter,
  featuredOnly = false,
  compact = false,
  onPostUpdate,
  onPostDelete,
}: Props) {
  // Magyar: Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
  const { isAuthenticated } = useAuth();
  const {
    posts,
    currentPage,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    searchQuery,
    selectedType,
    fetchPosts,
    setSearchQuery,
    setSelectedType,
    updatePostLocally,
    removePostLocally,
  } = usePosts();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSelectedType, setLocalSelectedType] = useState<string>(typeFilter || 'all');
  const [searchTimeoutId, setSearchTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Magyar: Hiba kezelése toast-ban optimalizálva
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Hiba történt',
        description: typeof error === 'string' ? error : 'Ismeretlen hiba',
        variant: 'destructive',
      });
    }
  }, [error]);

  // Magyar: Posztok optimalizált betöltése
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      return;
    }

    const params = {
      page: 1,
      limit: 10,
      search: searchQuery || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      author: authorFilter || undefined,
      featured: featuredOnly || undefined,
    };

    fetchPosts(params, false);
  }, [initialPosts, searchQuery, selectedType, authorFilter, featuredOnly, fetchPosts]);

  // Magyar: Debounced keresés implementálása
  const debouncedSearch = useCallback(
    (value: string) => {
      if (searchTimeoutId) {
        clearTimeout(searchTimeoutId);
      }

      const timeoutId = setTimeout(() => {
        setSearchQuery(value);
      }, 300);

      setSearchTimeoutId(timeoutId);
    },
    [searchTimeoutId, setSearchQuery],
  );

  // Magyar: Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutId) {
        clearTimeout(searchTimeoutId);
      }
    };
  }, [searchTimeoutId]);

  // Magyar: Poszt frissítése optimalizálva
  const handlePostUpdate = useCallback(
    (postId: string, updates: Partial<Post>) => {
      updatePostLocally(postId, updates);
      if (onPostUpdate) {
        const currentPosts = initialPosts || posts;
        const updatedPost = currentPosts.find(post => post.id === postId);
        if (updatedPost) {
          onPostUpdate({ ...updatedPost, ...updates });
        }
      }
      toast({
        title: 'Poszt frissítve',
        description: 'A poszt sikeresen frissítve lett.',
        variant: 'default',
      });
    },
    [updatePostLocally, onPostUpdate, initialPosts, posts],
  );

  // Magyar: Poszt törlése optimalizálva
  const handlePostDelete = useCallback(
    (postId: string) => {
      removePostLocally(postId);
      if (onPostDelete) {
        onPostDelete(postId);
      }
      toast({
        title: 'Poszt törölve',
        description: 'A poszt sikeresen törölve lett.',
        variant: 'default',
      });
    },
    [removePostLocally, onPostDelete],
  );

  // Store in a ref to avoid unused variable warning
  // This function is available for future use or external API calls
  const deleteHandlerRef = React.useRef(handlePostDelete);
  deleteHandlerRef.current = handlePostDelete;

  // Magyar: További posztok betöltése optimalizálva
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const params = {
        page: currentPage + 1,
        limit: 10,
        search: searchQuery || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        author: authorFilter || undefined,
        featured: featuredOnly || undefined,
      };
      fetchPosts(params, true);
    }
  }, [
    isLoadingMore,
    hasMore,
    currentPage,
    searchQuery,
    selectedType,
    authorFilter,
    featuredOnly,
    fetchPosts,
  ]);

  // Magyar: Keresés kezelése optimalizálva
  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Magyar: Típus szűrő kezelése optimalizálva
  const handleTypeChange = useCallback(
    (value: string) => {
      setLocalSelectedType(value);
      setSelectedType(value);
    },
    [setSelectedType],
  );

  // Magyar: Posztok listája optimalizálva (memoized)
  const postsToDisplay = useMemo(() => initialPosts || posts, [initialPosts, posts]);

  // Magyar: Típusonkénti darabszám optimalizálva (memoized)
  const postTypeCounts = useMemo(() => {
    return {
      general: postsToDisplay.filter(post => post.type === 'general').length,
      discussion: postsToDisplay.filter(post => post.type === 'discussion').length,
      news: postsToDisplay.filter(post => post.type === 'news').length,
      analysis: postsToDisplay.filter(post => post.type === 'analysis').length,
      help_request: postsToDisplay.filter(post => post.type === 'help_request').length,
    };
  }, [postsToDisplay]);

  // Magyar: Keresési eredmény információ (memoized)
  const searchResultInfo = useMemo(() => {
    const totalCount = postsToDisplay.length;
    const hasSearchQuery = Boolean(localSearchQuery?.trim());
    return { totalCount, hasSearchQuery };
  }, [postsToDisplay.length, localSearchQuery]);

  // Magyar: Betöltési skeleton optimalizálva
  if (isLoading && postsToDisplay.length === 0) {
    return <PostListSkeleton />;
  }

  return (
    <div className='space-y-6'>
      {/* Magyar: Fejléc keresővel és szűrőkkel */}
      {showFilters && (
        <PostListFilters
          localSearchQuery={localSearchQuery}
          localSelectedType={localSelectedType}
          postTypeCounts={postTypeCounts}
          totalCount={searchResultInfo.totalCount}
          hasSearchQuery={searchResultInfo.hasSearchQuery}
          featuredOnly={featuredOnly}
          showCreateButton={showCreateButton}
          isAuthenticated={isAuthenticated}
          onSearch={handleSearch}
          onTypeChange={handleTypeChange}
        />
      )}

      {/* Magyar: Posztok grid vagy üres állapot */}
      {postsToDisplay.length === 0 && !isLoading ? (
        <PostListEmptyState
          searchQuery={localSearchQuery}
          isAuthenticated={isAuthenticated}
          showCreateButton={showCreateButton}
        />
      ) : (
        <div className='space-y-6'>
          {/* Magyar: Posztkártyák optimalizált rendereléssel */}
          {postsToDisplay.map(post => (
            <MemoizedPostCard
              key={post.id}
              post={post}
              onPostUpdate={updates => handlePostUpdate(post.id, updates)}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Magyar: További posztok betöltése gomb */}
      {postsToDisplay.length > 0 && (
        <PostListLoadMore
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}

// Magyar: PostCard optimalizált memo-val és prop comparison-nel
const MemoizedPostCard = React.memo(PostCard, (prevProps, nextProps) => {
  // Magyar: Csak akkor re-render, ha lényeges propok változtak
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.title === nextProps.post.title &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.likes_count === nextProps.post.likes_count &&
    prevProps.post.dislikes_count === nextProps.post.dislikes_count &&
    prevProps.post.comments_count === nextProps.post.comments_count &&
    prevProps.post.views_count === nextProps.post.views_count &&
    prevProps.post.user_bookmarked === nextProps.post.user_bookmarked &&
    prevProps.post.user_vote === nextProps.post.user_vote &&
    prevProps.compact === nextProps.compact
  );
});
