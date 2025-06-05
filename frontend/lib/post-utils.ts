/**
 * Post típushoz kapcsolódó segédfüggvények és konstansok
 * Post type related utility functions and constants
 */

import { BarChart3, FileText, HelpCircle, MessageSquare, Newspaper } from 'lucide-react';

// Magyar: Post típusok definíciói
export const POST_TYPES = {
  general: 'general',
  discussion: 'discussion',
  analysis: 'analysis',
  help_request: 'help_request',
  news: 'news',
} as const;

export type PostType = keyof typeof POST_TYPES;

// Magyar: Post típusok ikonjai
export const getPostTypeIcon = (type: string) => {
  switch (type) {
    case POST_TYPES.general:
      return MessageSquare;
    case POST_TYPES.discussion:
      return MessageSquare;
    case POST_TYPES.news:
      return Newspaper;
    case POST_TYPES.analysis:
      return BarChart3;
    case POST_TYPES.help_request:
      return HelpCircle;
    default:
      return FileText;
  }
};

// Magyar: Post típusok stílus variánsai
export const getPostTypeVariant = (type: string) => {
  const variants = {
    [POST_TYPES.general]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    [POST_TYPES.discussion]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [POST_TYPES.news]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    [POST_TYPES.analysis]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    [POST_TYPES.help_request]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  } as const;

  return variants[type as keyof typeof variants] || variants[POST_TYPES.discussion];
};

// Magyar: Post típus magyar nevei
export const getPostTypeLabel = (type: string) => {
  const labels = {
    [POST_TYPES.general]: 'Általános',
    [POST_TYPES.discussion]: 'Beszélgetés',
    [POST_TYPES.news]: 'Hírek',
    [POST_TYPES.analysis]: 'Elemzés',
    [POST_TYPES.help_request]: 'Segítség kérés',
  } as const;

  return labels[type as keyof typeof labels] || 'Poszt';
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
