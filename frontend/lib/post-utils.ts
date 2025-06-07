/**
 * Post típushoz kapcsolódó segédfüggvények és konstansok
 * Post type related utility functions and constants
 */

import {
  BarChart3,
  Eye,
  FileText,
  Heart,
  HelpCircle,
  MessageSquare,
  Newspaper,
} from 'lucide-react';

// Magyar: Post típusok definíciói (kiterjesztett)
export const POST_TYPES = {
  general: 'general',
  discussion: 'discussion',
  analysis: 'analysis',
  help_request: 'help_request',
  news: 'news',
  tip: 'tip',
  prediction: 'prediction',
} as const;

export type PostType = keyof typeof POST_TYPES;

// Magyar nyelvi fordítások a post típusokhoz (központosított)
export const POST_TYPE_TRANSLATIONS = {
  general: 'Általános',
  discussion: 'Beszélgetés',
  analysis: 'Elemzés',
  help_request: 'Segítségkérés',
  news: 'Hírek',
  tip: 'Tipp',
  prediction: 'Előrejelzés',
} as const;

// Magyar: Post típusok ikonjai (kiterjesztett)
export const getPostTypeIcon = (type: string) => {
  switch (type) {
    case POST_TYPES.general:
      return FileText;
    case POST_TYPES.discussion:
      return MessageSquare;
    case POST_TYPES.news:
      return Newspaper;
    case POST_TYPES.analysis:
      return BarChart3;
    case POST_TYPES.help_request:
      return HelpCircle;
    case POST_TYPES.tip:
      return Heart;
    case POST_TYPES.prediction:
      return Eye;
    default:
      return FileText;
  }
};

// Magyar: Post típusok stílus variánsai (kiterjesztett)
export const getPostTypeVariant = (type: string) => {
  const variants = {
    [POST_TYPES.general]: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
    [POST_TYPES.discussion]: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    [POST_TYPES.analysis]: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    [POST_TYPES.help_request]: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    [POST_TYPES.news]: 'bg-red-500/20 text-red-300 border-red-500/40',
    [POST_TYPES.tip]: 'bg-green-500/20 text-green-300 border-green-500/40',
    [POST_TYPES.prediction]: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  } as const;

  return variants[type as keyof typeof variants] || variants[POST_TYPES.general];
};

// Magyar: Post típus magyar nevei (kiterjesztett)
export const getPostTypeLabel = (type: string) => {
  return POST_TYPE_TRANSLATIONS[type as keyof typeof POST_TYPE_TRANSLATIONS] || type;
};

// Magyar: Post statisztikák formázása
export const formatPostStats = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Magyar: Reputation szint meghatározása
export const getReputationLevel = (
  score: number,
): 'beginner' | 'intermediate' | 'expert' | 'master' => {
  if (score >= 1000) return 'master';
  if (score >= 500) return 'expert';
  if (score >= 100) return 'intermediate';
  return 'beginner';
};

// Magyar: Reputation badge színek
export const getReputationBadgeColor = (score: number): string => {
  const level = getReputationLevel(score);
  const colors = {
    beginner: 'text-gray-400',
    intermediate: 'text-blue-400',
    expert: 'text-purple-400',
    master: 'text-amber-400',
  };
  return colors[level];
};

// Magyar: Tipp részletek ellenőrzése
export const hasTipDetails = (post: {
  type: string;
  odds?: number;
  stake?: number;
  confidence?: number;
}): boolean => {
  return post.type === 'tip' && (!!post.odds || !!post.stake || !!post.confidence);
};

// Magyar: Kép URL ellenőrzése
export const hasImage = (post: { image_url?: string }): boolean => {
  return !!(post.image_url && post.image_url.length > 0);
};

// Magyar: Tartalom rövidítése
export const truncateContent = (content: string, maxLength: number = 120): string => {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + '...';
};

// Magyar: Bejelentkezés szükséges figyelmeztetés
export const requireAuth = (isAuthenticated: boolean, action: string): boolean => {
  if (!isAuthenticated) {
    // A toast importálható a komponensben ahol használjuk
    return false;
  }
  return true;
};

// Magyar: Post típusok darabszámának kiszámítása
export const calculatePostTypeCounts = (posts: Array<{ type: string }>) => {
  return {
    general: posts.filter(post => post.type === 'general').length,
    discussion: posts.filter(post => post.type === 'discussion').length,
    news: posts.filter(post => post.type === 'news').length,
    analysis: posts.filter(post => post.type === 'analysis').length,
    help_request: posts.filter(post => post.type === 'help_request').length,
  };
};
