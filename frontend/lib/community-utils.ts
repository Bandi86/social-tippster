/**
 * Közösségi statisztikákhoz kapcsolódó segédfüggvények és típusok
 * Community statistics related utility functions and types
 */

// Types
export interface CommunityStats {
  total_users: number;
  active_users_today: number;
  total_posts: number;
  posts_today: number;
  total_comments: number;
  comments_today: number;
  success_rate: number;
  avg_accuracy: number;
  updated_at: string;
}

export interface TopContributor {
  id: string;
  username: string;
  points: number;
  rank: number;
  badge: string;
  avatar?: string;
  reputation_score: number;
  posts_count: number;
  accuracy_rate: number;
}

export interface RecentActivity {
  id: string;
  type: 'post' | 'comment' | 'vote' | 'follow';
  user: {
    username: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  target?: {
    title: string;
    id: string;
  };
}

export interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
}

// Valós idejű közösségi statisztikák
export interface RealTimeCommunityStats {
  onlineUsers: number;
  totalMembers: number;
  postsToday: number;
  activeTips: number;
  totalRevenue: number;
  averageAccuracy: number;
  newMembersToday: number;
  popularSports: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  lastUpdated: Date;
}

// Közösségi statisztikai elem
export interface CommunityStatItem {
  id: string;
  label: string;
  value: string | number;
  color: string;
  showIndicator?: boolean;
  indicatorColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

// Statisztika formázás
export const formatStatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Pontszám kategóriák
export const getUserBadge = (points: number): string => {
  if (points >= 2000) return '🏆';
  if (points >= 1500) return '🥈';
  if (points >= 1000) return '🥉';
  if (points >= 500) return '⭐';
  return '🔥';
};

// Rang szín meghatározás
export const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'from-yellow-400 to-yellow-600';
    case 2:
      return 'from-gray-400 to-gray-600';
    case 3:
      return 'from-amber-600 to-amber-800';
    default:
      return 'from-blue-500 to-blue-600';
  }
};

// Aktivitás típus formázás
export const formatActivityType = (type: RecentActivity['type']): string => {
  const types = {
    post: 'új posztot írt',
    comment: 'kommentelt',
    vote: 'szavazott',
    follow: 'követni kezdett',
  };
  return types[type] || 'aktivitás';
};

// Trend színek
export const getTrendColor = (trend: QuickStat['trend']): string => {
  switch (trend) {
    case 'up':
      return 'text-green-400';
    case 'down':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

// Valós idejű statisztikák formázása
export const formatCommunityStats = (data: RealTimeCommunityStats): CommunityStatItem[] => {
  return [
    {
      id: 'online-users',
      label: 'Online felhasználók',
      value: data.onlineUsers,
      color: 'text-green-400',
      showIndicator: true,
      indicatorColor: 'bg-green-400',
    },
    {
      id: 'total-members',
      label: 'Összes tag',
      value: data.totalMembers,
      color: 'text-amber-400',
    },
    {
      id: 'posts-today',
      label: 'Mai posztok',
      value: data.postsToday,
      color: 'text-blue-400',
    },
    {
      id: 'active-tips',
      label: 'Aktív tippek',
      value: data.activeTips,
      color: 'text-purple-400',
    },
  ];
};

// Mock data helpers (to be replaced with real API calls)
export const getMockCommunityStats = (): CommunityStats => ({
  total_users: 12547,
  active_users_today: 1432,
  total_posts: 8934,
  posts_today: 156,
  total_comments: 34567,
  comments_today: 678,
  success_rate: 73.5,
  avg_accuracy: 68.2,
  updated_at: new Date().toISOString(),
});

export const getMockTopContributors = (): TopContributor[] => [
  {
    id: '1',
    username: 'ProTipper',
    points: 2456,
    rank: 1,
    badge: '🏆',
    reputation_score: 98,
    posts_count: 234,
    accuracy_rate: 87.5,
  },
  {
    id: '2',
    username: 'SportsFan',
    points: 1987,
    rank: 2,
    badge: '🥈',
    reputation_score: 92,
    posts_count: 189,
    accuracy_rate: 82.3,
  },
  {
    id: '3',
    username: 'BetMaster',
    points: 1654,
    rank: 3,
    badge: '🥉',
    reputation_score: 88,
    posts_count: 156,
    accuracy_rate: 79.8,
  },
  {
    id: '4',
    username: 'AnalysisKing',
    points: 1432,
    rank: 4,
    badge: '⭐',
    reputation_score: 85,
    posts_count: 134,
    accuracy_rate: 75.2,
  },
  {
    id: '5',
    username: 'TippGuru',
    points: 1298,
    rank: 5,
    badge: '🔥',
    reputation_score: 81,
    posts_count: 98,
    accuracy_rate: 73.6,
  },
];

export const getMockRecentActivity = (): RecentActivity[] => [
  {
    id: '1',
    type: 'post',
    user: { username: 'SportExpert', avatar: '/avatars/expert.jpg' },
    content: 'Chelsea vs Arsenal előrejelzés',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    target: { title: 'Chelsea vs Arsenal előrejelzés', id: 'post-1' },
  },
  {
    id: '2',
    type: 'comment',
    user: { username: 'FanOfFootball' },
    content: 'Remek elemzés a tegnapi meccsről!',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    target: { title: 'Manchester United elemzés', id: 'post-2' },
  },
  {
    id: '3',
    type: 'vote',
    user: { username: 'BettingKing' },
    content: 'tetszésnek jelölte',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    target: { title: 'Premier League tippek', id: 'post-3' },
  },
];

export const getMockQuickStats = (): QuickStat[] => [
  {
    label: 'Mai tippek',
    value: 156,
    change: '+12%',
    trend: 'up',
    icon: '📈',
  },
  {
    label: 'Aktív felhasználók',
    value: '1.4K',
    change: '+8%',
    trend: 'up',
    icon: '👥',
  },
  {
    label: 'Sikeres tippek',
    value: '73%',
    change: '+2%',
    trend: 'up',
    icon: '🎯',
  },
  {
    label: 'Új tagok',
    value: 47,
    change: '+15%',
    trend: 'up',
    icon: '✨',
  },
];

// API hívások (to be implemented)
export const fetchCommunityStats = async (): Promise<CommunityStats> => {
  // TODO: Implement real API call
  return getMockCommunityStats();
};

export const fetchTopContributors = async (limit: number = 5): Promise<TopContributor[]> => {
  // TODO: Implement real API call
  return getMockTopContributors().slice(0, limit);
};

export const fetchRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
  // TODO: Implement real API call
  return getMockRecentActivity().slice(0, limit);
};

export const fetchQuickStats = async (): Promise<QuickStat[]> => {
  // TODO: Implement real API call
  return getMockQuickStats();
};

// Közösségi statisztikák cache kezelése
const COMMUNITY_STATS_CACHE_KEY = 'social_platform_community_stats_cache';
const CACHE_DURATION = 3 * 60 * 1000; // 3 perc

export const getCachedCommunityStats = (): RealTimeCommunityStats | null => {
  try {
    const cached = localStorage.getItem(COMMUNITY_STATS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(COMMUNITY_STATS_CACHE_KEY);
      return null;
    }

    // Dátum helyreállítása
    if (data.lastUpdated) {
      data.lastUpdated = new Date(data.lastUpdated);
    }

    return data;
  } catch {
    return null;
  }
};

export const setCachedCommunityStats = (data: RealTimeCommunityStats): void => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(COMMUNITY_STATS_CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Sikertelen cache mentés nem kritikus hiba
  }
};

// Mock API függvény a valós idejű statisztikákhoz
export const fetchRealTimeCommunityStats = async (): Promise<RealTimeCommunityStats> => {
  // TODO: Valódi API hívás implementálása
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        onlineUsers: Math.floor(Math.random() * 500) + 800,
        totalMembers: Math.floor(Math.random() * 1000) + 12000,
        postsToday: Math.floor(Math.random() * 50) + 70,
        activeTips: Math.floor(Math.random() * 80) + 140,
        totalRevenue: Math.floor(Math.random() * 1000000) + 5000000,
        averageAccuracy: Math.floor(Math.random() * 15) + 80,
        newMembersToday: Math.floor(Math.random() * 20) + 10,
        popularSports: [
          { name: 'Futball', count: 45, percentage: 35 },
          { name: 'Kosárlabda', count: 23, percentage: 18 },
          { name: 'Tenisz', count: 18, percentage: 14 },
          { name: 'Amerikai futball', count: 15, percentage: 12 },
        ],
        lastUpdated: new Date(),
      });
    }, 250);
  });
};
