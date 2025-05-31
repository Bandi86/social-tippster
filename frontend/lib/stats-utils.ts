/**
 * Statisztikai adatok kezelése és formázása
 * Statistics data management and formatting utilities
 */

import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';

// Statisztikai elem típusa
export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color: {
    from: string;
    to: string;
    text: string;
  };
  icon?: LucideIcon;
}

// Statisztikai adatok típusa
export interface StatsData {
  newPosts: number;
  activeTips: number;
  onlineUsers: number;
  accuracy: number;
  totalBets: number;
  winRate: number;
  dailyRevenue: number;
  popularSports: Array<{
    name: string;
    count: number;
  }>;
}

// Gyors statisztikák formázása
export const formatQuickStats = (data: StatsData): StatItem[] => {
  return [
    {
      id: 'new-posts',
      label: 'Új posztok',
      value: formatStatValue(data.newPosts),
      color: {
        from: 'amber-900/30',
        to: 'amber-800/30',
        text: 'amber-400',
      },
      trend: getTrend(data.newPosts, 65), // Összehasonlítás előző nappal
      trendValue: calculateTrendPercentage(data.newPosts, 65),
    },
    {
      id: 'active-tips',
      label: 'Aktív tippek',
      value: formatStatValue(data.activeTips),
      color: {
        from: 'green-900/30',
        to: 'green-800/30',
        text: 'green-400',
      },
      trend: getTrend(data.activeTips, 120),
      trendValue: calculateTrendPercentage(data.activeTips, 120),
    },
    {
      id: 'online-users',
      label: 'Online',
      value: formatStatValue(data.onlineUsers),
      color: {
        from: 'blue-900/30',
        to: 'blue-800/30',
        text: 'blue-400',
      },
      trend: getTrend(data.onlineUsers, 900),
      trendValue: calculateTrendPercentage(data.onlineUsers, 900),
    },
    {
      id: 'accuracy',
      label: 'Pontosság',
      value: `${data.accuracy}%`,
      color: {
        from: 'purple-900/30',
        to: 'purple-800/30',
        text: 'purple-400',
      },
      trend: getTrend(data.accuracy, 82),
      trendValue: calculateTrendPercentage(data.accuracy, 82),
    },
  ];
};

// Részletes statisztikák formázása
export const formatDetailedStats = (data: StatsData): StatItem[] => {
  return [
    {
      id: 'total-bets',
      label: 'Összes fogadás',
      value: formatStatValue(data.totalBets),
      color: {
        from: 'indigo-900/30',
        to: 'indigo-800/30',
        text: 'indigo-400',
      },
    },
    {
      id: 'win-rate',
      label: 'Nyerési arány',
      value: `${data.winRate}%`,
      color: {
        from: 'emerald-900/30',
        to: 'emerald-800/30',
        text: 'emerald-400',
      },
    },
    {
      id: 'daily-revenue',
      label: 'Napi bevétel',
      value: formatCurrency(data.dailyRevenue),
      color: {
        from: 'yellow-900/30',
        to: 'yellow-800/30',
        text: 'yellow-400',
      },
    },
  ];
};

// Statisztikai érték formázása
export const formatStatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('hu-HU');
};

// Pénzösszeg formázása
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Trend meghatározása
export const getTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
  const difference = current - previous;
  if (Math.abs(difference) < previous * 0.05) return 'neutral'; // 5% tolerancia
  return difference > 0 ? 'up' : 'down';
};

// Trend százalék számítása
export const calculateTrendPercentage = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Trend ikon lekérése
export const getTrendIcon = (trend: 'up' | 'down' | 'neutral'): LucideIcon => {
  switch (trend) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return Minus;
  }
};

// Trend szín lekérése
export const getTrendColor = (trend: 'up' | 'down' | 'neutral'): string => {
  switch (trend) {
    case 'up':
      return 'text-green-400';
    case 'down':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

// Mock API függvény a statisztikai adatok lekéréséhez
export const fetchQuickStats = async (): Promise<StatsData> => {
  // TODO: Valódi API hívás implementálása
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        newPosts: Math.floor(Math.random() * 50) + 60,
        activeTips: Math.floor(Math.random() * 80) + 120,
        onlineUsers: Math.floor(Math.random() * 500) + 800,
        accuracy: Math.floor(Math.random() * 15) + 80,
        totalBets: Math.floor(Math.random() * 1000) + 5000,
        winRate: Math.floor(Math.random() * 20) + 70,
        dailyRevenue: Math.floor(Math.random() * 500000) + 1000000,
        popularSports: [
          { name: 'Futball', count: 45 },
          { name: 'Kosárlabda', count: 23 },
          { name: 'Tenisz', count: 18 },
        ],
      });
    }, 300);
  });
};

// Statisztikai adatok validálása
export const validateStatsData = (data: any): data is StatsData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.newPosts === 'number' &&
    typeof data.activeTips === 'number' &&
    typeof data.onlineUsers === 'number' &&
    typeof data.accuracy === 'number' &&
    typeof data.totalBets === 'number' &&
    typeof data.winRate === 'number' &&
    typeof data.dailyRevenue === 'number' &&
    Array.isArray(data.popularSports)
  );
};

// Statisztikai tétel alapértelmezett értékei
export const getDefaultStatItem = (id: string): StatItem => {
  return {
    id,
    label: 'Betöltés...',
    value: '...',
    color: {
      from: 'gray-900/30',
      to: 'gray-800/30',
      text: 'gray-400',
    },
  };
};

// Statisztikai adatok cache-elése
const STATS_CACHE_KEY = 'social_tippster_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 perc

export const getCachedStats = (): StatsData | null => {
  try {
    const cached = localStorage.getItem(STATS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(STATS_CACHE_KEY);
      return null;
    }

    return validateStatsData(data) ? data : null;
  } catch {
    return null;
  }
};

export const setCachedStats = (data: StatsData): void => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Sikertelen cache mentés nem kritikus hiba
  }
};
