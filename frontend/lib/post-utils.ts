/**
 * Post típushoz kapcsolódó segédfüggvények és konstansok
 * Post type related utility functions and constants
 */

import { BarChart3, FileText, MessageSquare, TrendingUp } from 'lucide-react';

// Magyar: Post típusok definíciói
export const POST_TYPES = {
  tip: 'tip',
  discussion: 'discussion',
  news: 'news',
  analysis: 'analysis',
} as const;

export type PostType = keyof typeof POST_TYPES;

// Magyar: Post típusok ikonjai
export const getPostTypeIcon = (type: string) => {
  switch (type) {
    case POST_TYPES.tip:
      return TrendingUp;
    case POST_TYPES.discussion:
      return MessageSquare;
    case POST_TYPES.news:
      return FileText;
    case POST_TYPES.analysis:
      return BarChart3;
    default:
      return FileText;
  }
};

// Magyar: Post típusok stílus variánsai
export const getPostTypeVariant = (type: string) => {
  const variants = {
    [POST_TYPES.tip]: 'bg-green-500/20 text-green-400 border-green-500/30',
    [POST_TYPES.discussion]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [POST_TYPES.news]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    [POST_TYPES.analysis]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  } as const;

  return variants[type as keyof typeof variants] || variants[POST_TYPES.discussion];
};

// Magyar: Post típus magyar nevei
export const getPostTypeLabel = (type: string) => {
  const labels = {
    [POST_TYPES.tip]: 'Tipp',
    [POST_TYPES.discussion]: 'Beszélgetés',
    [POST_TYPES.news]: 'Hírek',
    [POST_TYPES.analysis]: 'Elemzés',
  } as const;

  return labels[type as keyof typeof labels] || 'Poszt';
};

// Magyar: Tipp részletek validálása
export const hasTipDetails = (post: {
  type: string;
  odds?: number;
  stake?: number;
  confidence?: number;
}): boolean => {
  return post.type === POST_TYPES.tip && !!(post.odds || post.stake || post.confidence);
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
