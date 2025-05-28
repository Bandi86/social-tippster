'use client';

import { Filter, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

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
import { Post, PostsResponse, fetchPosts } from '@/lib/api/posts';
import { useAuthStore } from '@/store/auth';
import PostCard from './PostCard';

interface PostListProps {
  initialPosts?: Post[];
  showCreateButton?: boolean;
  showFilters?: boolean;
  authorFilter?: string;
  typeFilter?: string;
  featuredOnly?: boolean;
  compact?: boolean;
}

export default function PostList({
  initialPosts,
  showCreateButton = true,
  showFilters = true,
  authorFilter,
  typeFilter,
  featuredOnly = false,
  compact = false,
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>(typeFilter || 'all');
  const [meta, setMeta] = useState<{ total: number; totalPages: number } | null>(null);

  const { isAuthenticated } = useAuthStore();

  const loadPosts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params: any = {
          page,
          limit: 10,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedType !== 'all') params.type = selectedType;
        if (authorFilter) params.author = authorFilter;
        if (featuredOnly) params.featured = true;

        const response: PostsResponse = await fetchPosts(params);

        if (append) {
          setPosts(prev => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }

        setMeta({
          total: response.total,
          totalPages: response.totalPages,
        });

        setHasMore(page < response.totalPages);
        setCurrentPage(page);
      } catch (error) {
        console.error('Failed to load posts:', error);
        toast({
          title: 'Hiba',
          description: 'A posztok betöltése sikertelen',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedType, authorFilter, featuredOnly],
  );

  // Load posts on mount and when filters change
  useEffect(() => {
    if (!initialPosts) {
      loadPosts(1, false);
    }
  }, [loadPosts, initialPosts]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialPosts) {
        loadPosts(1, false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedType]);

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(post => (post.id === postId ? { ...post, ...updates } : post)));
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(currentPage + 1, true);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const getPostTypeCount = (type: string) => {
    if (!meta) return 0;
    // This would ideally come from the API
    return posts.filter(post => post.type === type).length;
  };

  if (loading && !posts.length) {
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
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    className='pl-10 bg-gray-800 border-gray-600 text-white'
                  />
                </div>

                {/* Type filter */}
                <Select value={selectedType} onValueChange={handleTypeFilter}>
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
            {meta && (
              <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-700'>
                <div className='text-sm text-gray-400'>
                  {meta.total} poszt találat
                  {searchQuery && (
                    <span>
                      {' '}
                      a "<span className='text-white'>{searchQuery}</span>" keresésre
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
      {posts.length === 0 && !loading ? (
        <Card className='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'>
          <CardContent className='p-8 text-center'>
            <div className='text-gray-400 mb-4'>
              {searchQuery ? (
                <>
                  <Search className='h-12 w-12 mx-auto mb-3' />
                  <p>Nincs találat a keresésre: "{searchQuery}"</p>
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
          {posts.map(post => (
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
      {hasMore && posts.length > 0 && (
        <div className='flex justify-center'>
          <Button
            variant='outline'
            onClick={handleLoadMore}
            disabled={loadingMore}
            className='border-amber-600 text-amber-400 hover:bg-amber-900/50'
          >
            {loadingMore ? (
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
