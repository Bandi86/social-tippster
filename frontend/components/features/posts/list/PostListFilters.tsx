'use client';

import { Filter, Plus, Search } from 'lucide-react';
import Link from 'next/link';

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

interface PostTypeCounts {
  general: number;
  discussion: number;
  news: number;
  analysis: number;
  help_request: number;
}

interface PostListFiltersProps {
  localSearchQuery: string;
  localSelectedType: string;
  postTypeCounts: PostTypeCounts;
  totalCount: number;
  hasSearchQuery: boolean;
  featuredOnly: boolean;
  showCreateButton: boolean;
  isAuthenticated: boolean;
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
}

/**
 * Magyar: PostList szűrő és keresés komponens
 * Handles search, filtering, and create button functionality
 */
export default function PostListFilters({
  localSearchQuery,
  localSelectedType,
  postTypeCounts,
  totalCount,
  hasSearchQuery,
  featuredOnly,
  showCreateButton,
  isAuthenticated,
  onSearch,
  onTypeChange,
}: PostListFiltersProps) {
  return (
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
                onChange={e => onSearch(e.target.value)}
                className='pl-10 bg-gray-800 border-gray-600 text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 transition'
              />
            </div>

            {/* Magyar: Típus szűrő */}
            <Select value={localSelectedType} onValueChange={onTypeChange}>
              <SelectTrigger className='w-[180px] bg-gray-800 border-gray-600 text-white rounded-lg'>
                <Filter className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Típus' />
              </SelectTrigger>
              <SelectContent className='bg-gray-800 border-gray-600'>
                <SelectItem value='all'>Összes típus</SelectItem>
                <SelectItem value='general'>Általános ({postTypeCounts.general})</SelectItem>
                <SelectItem value='discussion'>
                  Beszélgetések ({postTypeCounts.discussion})
                </SelectItem>
                <SelectItem value='news'>Hírek ({postTypeCounts.news})</SelectItem>
                <SelectItem value='analysis'>Elemzések ({postTypeCounts.analysis})</SelectItem>
                <SelectItem value='help_request'>
                  Segítségkérés ({postTypeCounts.help_request})
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
        {totalCount > 0 && (
          <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-700'>
            <div className='text-sm text-gray-400'>
              {totalCount} poszt találat
              {hasSearchQuery && (
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
  );
}
