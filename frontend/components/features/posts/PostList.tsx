'use client';

import { Filter, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/store/posts';
import React from 'react';
import PostCard from './PostCard';

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
  const debouncedSearch = useCallback((value: string) => {
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
    
    setSearchTimeoutId(timeoutId);
  }, [searchTimeoutId, setSearchQuery]);

  // Magyar: Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutId) {
        clearTimeout(searchTimeoutId);
      }
    };
  }, [searchTimeoutId]);

  // Magyar: Poszt frissítése optimalizálva
  const handlePostUpdate = useCallback((postId: string, updates: Partial<Post>) => {
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
  }, [updatePostLocally, onPostUpdate, initialPosts, posts]);

  // Magyar: Poszt törlése optimalizálva
  const handlePostDelete = useCallback((postId: string) => {
    removePostLocally(postId);
    if (onPostDelete) {
      onPostDelete(postId);
    }
    toast({
      title: 'Poszt törölve',
      description: 'A poszt sikeresen törölve lett.',
      variant: 'default',
    });
  }, [removePostLocally, onPostDelete]);

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
  }, [isLoadingMore, hasMore, currentPage, searchQuery, selectedType, authorFilter, featuredOnly, fetchPosts]);

  // Magyar: Keresés kezelése optimalizálva
  const handleSearch = useCallback((value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Magyar: Típus szűrő kezelése optimalizálva  
  const handleTypeChange = useCallback((value: string) => {
    setLocalSelectedType(value);
    setSelectedType(value);
  }, [setSelectedType]);

  // Magyar: Posztok listája optimalizálva (memoized)
  const postsToDisplay = useMemo(() => initialPosts || posts, [initialPosts, posts]);

  // Magyar: Típusonkénti darabszám optimalizálva (memoized)
  const postTypeCounts = useMemo(() => {
    return {
      tip: postsToDisplay.filter(post => post.type === 'tip').length,
      discussion: postsToDisplay.filter(post => post.type === 'discussion').length,
      news: postsToDisplay.filter(post => post.type === 'news').length,
      analysis: postsToDisplay.filter(post => post.type === 'analysis').length,
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
    return (
      <div className='flex flex-col gap-4 py-12'>
        {[...Array(4)].map((_, i) => (
          <Card key={`skeleton-${i}`} className='bg-gray-800 border-gray-700'>
            <CardContent className='p-6'>
              <div className='animate-pulse space-y-4'>
                <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                <div className='h-3 bg-gray-700 rounded w-1/2'></div>
                <div className='h-20 bg-gray-700 rounded'></div>
                <div className='flex gap-4'>
                  <div className='h-3 bg-gray-700 rounded w-16'></div>
                  <div className='h-3 bg-gray-700 rounded w-16'></div>
                  <div className='h-3 bg-gray-700 rounded w-16'></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className='flex justify-center'>
          <div className='flex items-center gap-2 text-gray-400'>
            <Loader2 className='h-5 w-5 animate-spin' />
            <span>Posztok betöltése...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Magyar: Fejléc keresővel és szűrőkkel */}
      {showFilters && (
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg'>
          <CardContent className='p-4'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
              <div className='flex flex-col sm:flex-row gap-4 flex-1'>
                {/* Magyar: Kereső mező */}
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Keresés posztokban...'
                    value={localSearchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    className='pl-10 bg-gray-800 border-gray-600 text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 transition'
                  />
                </div>
                {/* Magyar: Típus szűrő */}
                <Select value={localSelectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className='w-[180px] bg-gray-800 border-gray-600 text-white rounded-lg'>
                    <Filter className='h-4 w-4 mr-2' />
                    <SelectValue placeholder='Típus' />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-800 border-gray-600'>
                    <SelectItem value='all'>Összes típus</SelectItem>
                    <SelectItem value='tip'>Tippek ({postTypeCounts.tip})</SelectItem>
                    <SelectItem value='discussion'>
                      Beszélgetések ({postTypeCounts.discussion})
                    </SelectItem>
                    <SelectItem value='news'>Hírek ({postTypeCounts.news})</SelectItem>
                    <SelectItem value='analysis'>
                      Elemzések ({postTypeCounts.analysis})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Magyar: Új poszt gomb */}
              {showCreateButton && isAuthenticated && (
                <Link href='/posts/create'>
                  <Button className='bg-amber-600 hover:bg-amber-700 whitespace-nowrap rounded-lg shadow-md transition'>
                    <Plus className='h-4 w-4 mr-2' />
                    Új poszt
                  </Button>
                </Link>
              )}
            </div>
            {/* Magyar: Találatok információ */}
            {searchResultInfo.totalCount > 0 && (
              <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-700'>
                <div className='text-sm text-gray-400'>
                  {searchResultInfo.totalCount} poszt találat
                  {searchResultInfo.hasSearchQuery && (
                    <span>
                      {' '}
                      a "<span className='text-white'>{localSearchQuery}</span>" keresésre
                    </span>
                  )}
                </div>
                {featuredOnly && (
                  <Badge variant='outline' className='border-amber-600 text-amber-400'>
                    Kiemelt posztok
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Magyar: Posztok grid vagy üres állapot */}
      {postsToDisplay.length === 0 && !isLoading ? (
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg'>
          <CardContent className='p-8 text-center'>
            <div className='text-gray-400 mb-4'>
              {localSearchQuery ? (
                <>
                  <Search className='h-12 w-12 mx-auto mb-3' />
                  <p>Nincs találat a keresésre: "{localSearchQuery}"</p>
                </>
              ) : (
                <>
                  <Plus className='h-12 w-12 mx-auto mb-3' />
                  <p>Még nincsenek posztok</p>
                </>
              )}
            </div>
            {isAuthenticated && showCreateButton && (
              <Link href='/posts/create'>
                <Button className='bg-amber-600 hover:bg-amber-700 rounded-lg shadow-md'>
                  <Plus className='h-4 w-4 mr-2' />
                  Első poszt létrehozása
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
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
      {hasMore && postsToDisplay.length > 0 && (
        <div className='flex justify-center'>
          <Button
            variant='outline'
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className='border-amber-600 text-amber-400 hover:bg-amber-900/50 rounded-lg shadow-md'
          >
            {isLoadingMore ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Betöltés...
              </>
            ) : (
              'További posztok betöltése'
            )}
          </Button>
        </div>
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
