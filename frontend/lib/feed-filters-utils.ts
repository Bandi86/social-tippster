/**
 * Poszt szűrési segédfüggvények
 * Post feed filtering utility functions
 */

import { Clock, Flame, LucideIcon, MessageSquare, Star, Target, TrendingUp } from 'lucide-react';

// Feed filter types
export type FeedFilterType =
  | 'all'
  | 'tips'
  | 'discussion'
  | 'analysis'
  | 'trending'
  | 'recent'
  | 'popular';

// Feed filter interface
export interface FeedFilter {
  id: FeedFilterType;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

// Available feed filters
export const FEED_FILTERS: FeedFilter[] = [
  {
    id: 'all',
    label: 'Összes',
    icon: Flame,
    description: 'Minden poszt megjelenítése',
    color: 'amber',
  },
  {
    id: 'tips',
    label: 'Tippek',
    icon: Target,
    description: 'Fogadási tippek',
    color: 'green',
  },
  {
    id: 'discussion',
    label: 'Beszélgetés',
    icon: MessageSquare,
    description: 'Általános megbeszélések',
    color: 'blue',
  },
  {
    id: 'analysis',
    label: 'Elemzések',
    icon: TrendingUp,
    description: 'Részletes meccs elemzések',
    color: 'purple',
  },
  {
    id: 'trending',
    label: 'Felkapott',
    icon: Flame,
    description: 'Népszerű posztok',
    color: 'red',
  },
  {
    id: 'recent',
    label: 'Friss',
    icon: Clock,
    description: 'Legfrissebb posztok',
    color: 'cyan',
  },
  {
    id: 'popular',
    label: 'Népszerű',
    icon: Star,
    description: 'Legjobban értékelt posztok',
    color: 'yellow',
  },
];

// Get filter by id
export const getFeedFilter = (id: FeedFilterType): FeedFilter | undefined => {
  return FEED_FILTERS.find(filter => filter.id === id);
};

// Get filter button styles
export const getFilterButtonStyles = (isSelected: boolean, color: string = 'amber'): string => {
  if (isSelected) {
    return `bg-${color}-600 text-white hover:bg-${color}-700`;
  }

  return `text-gray-400 hover:text-white hover:bg-gray-800/50`;
};

// Get primary filters (most commonly used)
export const getPrimaryFilters = (): FeedFilter[] => {
  return FEED_FILTERS.filter(filter =>
    ['all', 'tips', 'discussion', 'analysis'].includes(filter.id),
  );
};

// Get secondary filters (additional sorting options)
export const getSecondaryFilters = (): FeedFilter[] => {
  return FEED_FILTERS.filter(filter => ['trending', 'recent', 'popular'].includes(filter.id));
};

// Sort order types
export type SortOrder = 'newest' | 'oldest' | 'most_popular' | 'most_commented';

export interface SortOption {
  id: SortOrder;
  label: string;
  description: string;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    id: 'newest',
    label: 'Legújabb',
    description: 'Legfrissebb posztok először',
  },
  {
    id: 'oldest',
    label: 'Legrégebbi',
    description: 'Legrégebbi posztok először',
  },
  {
    id: 'most_popular',
    label: 'Legnépszerűbb',
    description: 'Legtöbb szavazattal rendelkező posztok',
  },
  {
    id: 'most_commented',
    label: 'Legtöbbet kommentezett',
    description: 'Legtöbb kommenttel rendelkező posztok',
  },
];

// Get sort option by id
export const getSortOption = (id: SortOrder): SortOption | undefined => {
  return SORT_OPTIONS.find(option => option.id === id);
};

// Filter validation
export const isValidFilter = (filter: string): filter is FeedFilterType => {
  return FEED_FILTERS.some(f => f.id === filter);
};

// Filter persistence
export const saveFilterPreference = (filter: FeedFilterType, sort?: SortOrder): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'feed_filter_preference',
      JSON.stringify({
        filter,
        sort: sort || 'newest',
        timestamp: new Date().toISOString(),
      }),
    );
  }
};

export const loadFilterPreference = (): { filter: FeedFilterType; sort: SortOrder } | null => {
  if (typeof window === 'undefined') return null;

  try {
    const preference = localStorage.getItem('feed_filter_preference');
    if (preference) {
      const parsed = JSON.parse(preference);
      // Validate the loaded data
      if (isValidFilter(parsed.filter) && getSortOption(parsed.sort)) {
        return {
          filter: parsed.filter,
          sort: parsed.sort,
        };
      }
    }
  } catch {
    // Invalid data, ignore
  }

  return null;
};

// Count display utilities
export const formatPostCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// Time range filters
export type TimeRange = 'today' | 'week' | 'month' | 'all_time';

export interface TimeRangeOption {
  id: TimeRange;
  label: string;
  description: string;
  days: number | null; // null for all time
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  {
    id: 'today',
    label: 'Ma',
    description: 'Mai posztok',
    days: 1,
  },
  {
    id: 'week',
    label: 'Ezen a héten',
    description: 'Az elmúlt 7 nap posztjai',
    days: 7,
  },
  {
    id: 'month',
    label: 'Ebben a hónapban',
    description: 'Az elmúlt 30 nap posztjai',
    days: 30,
  },
  {
    id: 'all_time',
    label: 'Minden időből',
    description: 'Összes poszt',
    days: null,
  },
];

export const getTimeRangeOption = (id: TimeRange): TimeRangeOption | undefined => {
  return TIME_RANGE_OPTIONS.find(option => option.id === id);
};
