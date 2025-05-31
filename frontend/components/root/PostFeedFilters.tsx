'use client';

import FilterButton from '@/components/shared/FilterButton';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FEED_FILTERS,
  FeedFilterType,
  getPrimaryFilters,
  loadFilterPreference,
  saveFilterPreference,
} from '@/lib/feed-filters-utils';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PostFeedFiltersProps {
  selectedCategory: FeedFilterType;
  onCategoryChange: (category: FeedFilterType) => void;
  showAllFilters?: boolean;
  className?: string;
}

/**
 * Poszt szűrő komponens
 * A felhasználók különböző kategóriák alapján szűrhetik a posztokat
 *
 * Most már moduláris, újrafelhasználható komponenseket használ
 * és menteni tudja a felhasználói preferenciákat
 */
export default function PostFeedFilters({
  selectedCategory,
  onCategoryChange,
  showAllFilters = false,
  className = '',
}: PostFeedFiltersProps) {
  const [initialized, setInitialized] = useState(false);

  // Load saved filter preference on mount
  useEffect(() => {
    if (!initialized) {
      const savedPreference = loadFilterPreference();
      if (savedPreference && savedPreference.filter !== selectedCategory) {
        onCategoryChange(savedPreference.filter);
      }
      setInitialized(true);
    }
  }, [initialized, selectedCategory, onCategoryChange]);

  // Save filter preference when it changes
  useEffect(() => {
    if (initialized) {
      saveFilterPreference(selectedCategory);
    }
  }, [selectedCategory, initialized]);

  const handleFilterChange = (filter: FeedFilterType) => {
    onCategoryChange(filter);
  };

  // Get filters to display
  const filtersToShow = showAllFilters ? FEED_FILTERS : getPrimaryFilters();

  return (
    <Card className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 ${className}`}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg text-white flex items-center gap-2'>
            <Flame className='h-5 w-5 text-amber-500' />
            Legfrissebb posztok
          </CardTitle>

          <div className='flex gap-2 flex-wrap'>
            {filtersToShow.map(filter => (
              <FilterButton
                key={filter.id}
                filter={filter}
                isSelected={selectedCategory === filter.id}
                onClick={() => handleFilterChange(filter.id)}
              />
            ))}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
