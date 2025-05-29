'use client';

import { Filter, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/store/posts';
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

  // Initialize posts if provided
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      // If we have initial posts, we don't need to fetch
      return;
    }

    // Load posts with filters
    const params = {
      page: 1,
      limit: 10,
      search: localSearchQuery || undefined,
      type: localSelectedType !== 'all' ? localSelectedType : undefined,
      author: authorFilter || undefined,
      featured: featuredOnly || undefined,
    };

    fetchPosts(params, false);
  }, [initialPosts, localSearchQuery, localSelectedType, authorFilter, featuredOnly, fetchPosts]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, setSearchQuery]);

  // Update store filters when local filters change
  useEffect(() => {
    setSelectedType(localSelectedType);
  }, [localSelectedType, setSelectedType]);

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    updatePostLocally(postId, updates);
    if (onPostUpdate) {
      const currentPosts = initialPosts || posts;
      const updatedPost = currentPosts.find(post => post.id === postId);
      if (updatedPost) {
        onPostUpdate({ ...updatedPost, ...updates });
      }
    }
  };

  const handlePostDelete = (postId: string) => {
    removePostLocally(postId);
    if (onPostDelete) {
      onPostDelete(postId);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const params = {
        page: currentPage + 1,
        limit: 10,
        search: searchQuery || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        author: authorFilter || undefined,
        featured: featuredOnly || undefined,
      };
      fetchPosts(params, true); // append = true
    }
  };

  const handleSearch = (value: string) => {
    setLocalSearchQuery(value);
  };

  const handleTypeChange = (value: string) => {
    setLocalSelectedType(value);
  };

  // Use initial posts if provided, otherwise use store posts
  const postsToDisplay = initialPosts || posts;

  const getPostTypeCount = (type: string) => {
    return postsToDisplay.filter(post => post.type === type).length;
  };

  if (isLoading && postsToDisplay.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-amber-400' />
        <span className='ml-2 text-gray-400'>Posztok betöltése...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with search and filters */}
      {showFilters && (
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
          <CardContent className='p-4'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
              <div className='flex flex-col sm:flex-row gap-4 flex-1'>
                {/* Search */}
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Keresés posztokban...'
                    value={localSearchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    className='pl-10 bg-gray-800 border-gray-600 text-white'
                  />
                </div>

                {/* Type filter */}
                <Select value={localSelectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className='w-[180px] bg-gray-800 border-gray-600 text-white'>
                    <Filter className='h-4 w-4 mr-2' />
                    <SelectValue placeholder='Típus' />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-800 border-gray-600'>
                    <SelectItem value='all'>Összes típus</SelectItem>
                    <SelectItem value='tip'>Tippek ({getPostTypeCount('tip')})</SelectItem>
                    <SelectItem value='discussion'>
                      Beszélgetések ({getPostTypeCount('discussion')})
                    </SelectItem>
                    <SelectItem value='news'>Hírek ({getPostTypeCount('news')})</SelectItem>
                    <SelectItem value='analysis'>
                      Elemzések ({getPostTypeCount('analysis')})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Create post button */}
              {showCreateButton && isAuthenticated && (
                <Link href='/posts/create'>
                  <Button className='bg-amber-600 hover:bg-amber-700 whitespace-nowrap'>
                    <Plus className='h-4 w-4 mr-2' />
                    Új poszt
                  </Button>
                </Link>
              )}
            </div>

            {/* Results info */}
            {postsToDisplay.length > 0 && (
              <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-700'>
                <div className='text-sm text-gray-400'>
                  {postsToDisplay.length} poszt találat
                  {localSearchQuery && (
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

      {/* Posts grid */}
      {postsToDisplay.length === 0 && !isLoading ? (
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
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
                <Button className='bg-amber-600 hover:bg-amber-700'>
                  <Plus className='h-4 w-4 mr-2' />
                  Első poszt létrehozása
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          {postsToDisplay.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdate={updates => handlePostUpdate(post.id, updates)}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasMore && postsToDisplay.length > 0 && (
        <div className='flex justify-center'>
          <Button
            variant='outline'
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
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
