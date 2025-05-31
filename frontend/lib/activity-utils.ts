/**
 * Aktivitás adatok kezelése és formázása
 * Activity data management and formatting utilities
 */

import { Eye, Heart, LucideIcon, MessageCircle, Share, TrendingUp, Users } from 'lucide-react';

// Aktivitás típusok
export type ActivityType =
  | 'comment'
  | 'like'
  | 'share'
  | 'tip_created'
  | 'tip_won'
  | 'tip_lost'
  | 'follow'
  | 'post_created'
  | 'achievement';

// Aktivitás elem interface
export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target?: {
    type: 'post' | 'tip' | 'user';
    title: string;
    id: string;
  };
  timestamp: Date;
  color: string;
  icon: LucideIcon;
}

// Aktivitás adatok típusa
export interface ActivityData {
  recent: ActivityItem[];
  totalCount: number;
  lastUpdated: Date;
}

// Aktivitás típus metaadatai
export const getActivityMeta = (type: ActivityType) => {
  const meta = {
    comment: {
      color: 'blue-600',
      icon: MessageCircle,
      actionText: 'kommentelt',
    },
    like: {
      color: 'red-600',
      icon: Heart,
      actionText: 'lájkolta',
    },
    share: {
      color: 'green-600',
      icon: Share,
      actionText: 'megosztotta',
    },
    tip_created: {
      color: 'amber-600',
      icon: TrendingUp,
      actionText: 'új tippet oszott meg',
    },
    tip_won: {
      color: 'emerald-600',
      icon: TrendingUp,
      actionText: 'nyert egy tippel',
    },
    tip_lost: {
      color: 'red-600',
      icon: TrendingUp,
      actionText: 'elvesztett egy tippet',
    },
    follow: {
      color: 'purple-600',
      icon: Users,
      actionText: 'követni kezdte',
    },
    post_created: {
      color: 'indigo-600',
      icon: Eye,
      actionText: 'új posztot hozott létre',
    },
    achievement: {
      color: 'yellow-600',
      icon: TrendingUp,
      actionText: 'elérést szerzett',
    },
  };

  return meta[type];
};

// Aktivitás szöveg formázása
export const formatActivityText = (activity: ActivityItem): string => {
  const meta = getActivityMeta(activity.type);
  let text = `${activity.user.name} ${meta.actionText}`;

  if (activity.target) {
    switch (activity.target.type) {
      case 'post':
        text += ` a "${activity.target.title}" posztra`;
        break;
      case 'tip':
        text += ` - ${activity.target.title}`;
        break;
      case 'user':
        text += ` ${activity.target.title}`;
        break;
    }
  }

  return text;
};

// Idő formázása
export const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'most';
  if (diffInMinutes < 60) return `${diffInMinutes} perc`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} óra`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} nap`;

  return timestamp.toLocaleDateString('hu-HU');
};

// Felhasználó kezdőbetűk generálása
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Mock aktivitás adatok generálása
export const generateMockActivity = (): ActivityItem[] => {
  const users = [
    { id: '1', name: 'János Kovács' },
    { id: '2', name: 'Péter Nagy' },
    { id: '3', name: 'Anna Szabó' },
    { id: '4', name: 'Márk Tóth' },
    { id: '5', name: 'Zsófia Kiss' },
  ];

  const posts = [
    'Chelsea vs Arsenal',
    'NBA előrejelzések',
    'La Liga tippek',
    'Champions League',
    'Premier League',
  ];

  const activities: ActivityItem[] = [];

  for (let i = 0; i < 6; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const post = posts[Math.floor(Math.random() * posts.length)];
    const activityTypes: ActivityType[] = ['comment', 'like', 'share', 'tip_created'];
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const meta = getActivityMeta(type);

    activities.push({
      id: `activity-${i}`,
      type,
      user: {
        ...user,
        initials: generateInitials(user.name),
      },
      action: meta.actionText,
      target:
        type !== 'tip_created'
          ? {
              type: 'post',
              title: post,
              id: `post-${i}`,
            }
          : undefined,
      timestamp: new Date(Date.now() - Math.random() * 3600000), // Utolsó 1 óra
      color: meta.color,
      icon: meta.icon,
    });
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// API függvény az aktivitások lekéréséhez
export const fetchRecentActivity = async (): Promise<ActivityData> => {
  // TODO: Valódi API hívás implementálása
  return new Promise(resolve => {
    setTimeout(() => {
      const recent = generateMockActivity();
      resolve({
        recent,
        totalCount: recent.length + Math.floor(Math.random() * 100),
        lastUpdated: new Date(),
      });
    }, 200);
  });
};

// Aktivitás adatok validálása
export const validateActivityData = (data: any): data is ActivityData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.recent) &&
    typeof data.totalCount === 'number' &&
    data.lastUpdated instanceof Date
  );
};

// Aktivitás cache kezelése
const ACTIVITY_CACHE_KEY = 'social_tippster_activity_cache';
const CACHE_DURATION = 2 * 60 * 1000; // 2 perc

export const getCachedActivity = (): ActivityData | null => {
  try {
    const cached = localStorage.getItem(ACTIVITY_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(ACTIVITY_CACHE_KEY);
      return null;
    }

    // Dátumok helyreállítása
    if (data.recent) {
      data.recent = data.recent.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    }
    if (data.lastUpdated) {
      data.lastUpdated = new Date(data.lastUpdated);
    }

    return validateActivityData(data) ? data : null;
  } catch {
    return null;
  }
};

export const setCachedActivity = (data: ActivityData): void => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(ACTIVITY_CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Sikertelen cache mentés nem kritikus hiba
  }
};

// Aktivitás szűrése típus szerint
export const filterActivitiesByType = (
  activities: ActivityItem[],
  types: ActivityType[],
): ActivityItem[] => {
  return activities.filter(activity => types.includes(activity.type));
};

// Aktivitás csoportosítása időszak szerint
export const groupActivitiesByTime = (activities: ActivityItem[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  return {
    today: activities.filter(a => a.timestamp >= today),
    yesterday: activities.filter(a => a.timestamp >= yesterday && a.timestamp < today),
    older: activities.filter(a => a.timestamp < yesterday),
  };
};
