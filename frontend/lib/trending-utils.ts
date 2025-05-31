/**
 * Trending témákhoz kapcsolódó segédfüggvények és típusok
 * Trending topics related utility functions and types
 */

// Types
export interface TrendingTopic {
  id: string;
  tag: string;
  posts: number;
  trend: string;
  category: 'sport' | 'general' | 'betting';
  created_at: string;
}

export interface TrendingStats {
  hourly_growth: number;
  daily_growth: number;
  weekly_growth: number;
}

// Trending topic formázás
export const formatTrendPercentage = (growth: number): string => {
  const sign = growth >= 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};

// Trending színek kategória alapján
export const getTrendingColor = (category: TrendingTopic['category']) => {
  const colors = {
    sport: 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50',
    betting: 'bg-green-900/30 text-green-300 hover:bg-green-900/50',
    general: 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50',
  };
  return colors[category] || colors.general;
};

// Trend irány színe
export const getTrendDirectionColor = (trend: string): string => {
  if (trend.startsWith('+')) return 'text-green-400';
  if (trend.startsWith('-')) return 'text-red-400';
  return 'text-gray-400';
};

// Mock data helper (to be replaced with real API calls)
export const getMockTrendingTopics = (): TrendingTopic[] => [
  {
    id: '1',
    tag: '#premier-league',
    posts: 234,
    trend: '+12%',
    category: 'sport',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    tag: '#NBA',
    posts: 189,
    trend: '+8%',
    category: 'sport',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    tag: '#tenisz',
    posts: 156,
    trend: '+5%',
    category: 'sport',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    tag: '#formula1',
    posts: 123,
    trend: '+15%',
    category: 'sport',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    tag: '#labdarugas',
    posts: 98,
    trend: '+3%',
    category: 'sport',
    created_at: new Date().toISOString(),
  },
];

// API hívások (to be implemented)
export const fetchTrendingTopics = async (limit: number = 5): Promise<TrendingTopic[]> => {
  // TODO: Implement real API call
  return getMockTrendingTopics().slice(0, limit);
};

export const getTrendingStats = async (): Promise<TrendingStats> => {
  // TODO: Implement real API call
  return {
    hourly_growth: 12.5,
    daily_growth: 8.3,
    weekly_growth: 15.7,
  };
};
