/**
 * Poszt létrehozással kapcsolódó segédfüggvények
 * Post creation related utility functions
 */

import { BookOpen, MessageSquare, TrendingUp } from 'lucide-react';

// Post action types
export type PostActionType = 'post' | 'tip' | 'analysis';

// Post action interface
export interface PostAction {
  id: PostActionType;
  label: string;
  icon: typeof MessageSquare;
  description: string;
  placeholder: string;
}

// Available post actions
export const POST_ACTIONS: PostAction[] = [
  {
    id: 'post',
    label: 'Poszt',
    icon: MessageSquare,
    description: 'Általános poszt vagy vélemény megosztása',
    placeholder: 'Mit gondolsz erről a meccsről?',
  },
  {
    id: 'tip',
    label: 'Tipp',
    icon: TrendingUp,
    description: 'Fogadási tipp megosztása',
    placeholder: 'Oszd meg a tipped...',
  },
  {
    id: 'analysis',
    label: 'Elemzés',
    icon: BookOpen,
    description: 'Részletes meccs elemzés',
    placeholder: 'Írd meg az elemzésed...',
  },
];

// Get post action by type
export const getPostAction = (type: PostActionType): PostAction | undefined => {
  return POST_ACTIONS.find(action => action.id === type);
};

// Get default placeholder text
export const getDefaultPlaceholder = (): string => {
  return POST_ACTIONS[0].placeholder;
};

// Get action button styles
export const getActionButtonStyles = (isSelected: boolean = false): string => {
  const baseStyles = 'text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors';
  const selectedStyles = 'text-amber-400 bg-gray-800/50';

  return isSelected ? `${baseStyles} ${selectedStyles}` : baseStyles;
};

// Authentication CTA messages
export const AUTH_CTA = {
  title: 'Fedezd fel a legjobb tippeket!',
  description:
    'Böngészd az összes posztot és elemzést. Jelentkezz be, hogy te is posztolhass, kommentelj és szavazz!',
  loginButton: 'Bejelentkezés',
  registerButton: 'Regisztráció',
  note: '✨ Minden tartalom megtekinthető regisztráció nélkül',
} as const;

// Post creation configuration
export const POST_CREATION_CONFIG = {
  maxLength: 1000,
  minLength: 10,
  autoSaveDelay: 2000,
  placeholderRotationInterval: 5000,
} as const;

// Validation functions
export const validatePostContent = (content: string): string | null => {
  if (!content.trim()) {
    return 'A poszt tartalma nem lehet üres';
  }

  if (content.trim().length < POST_CREATION_CONFIG.minLength) {
    return `A poszt legalább ${POST_CREATION_CONFIG.minLength} karakter hosszú legyen`;
  }

  if (content.length > POST_CREATION_CONFIG.maxLength) {
    return `A poszt maximum ${POST_CREATION_CONFIG.maxLength} karakter hosszú lehet`;
  }

  return null;
};

// Character count helpers
export const getCharacterCount = (content: string): number => {
  return content.length;
};

export const getRemainingCharacters = (content: string): number => {
  return POST_CREATION_CONFIG.maxLength - content.length;
};

export const getCharacterCountColor = (content: string): string => {
  const remaining = getRemainingCharacters(content);

  if (remaining < 50) return 'text-red-400';
  if (remaining < 150) return 'text-yellow-400';
  return 'text-gray-400';
};

// Draft management
export const saveDraft = (content: string, type: PostActionType): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'post_draft',
      JSON.stringify({
        content,
        type,
        timestamp: new Date().toISOString(),
      }),
    );
  }
};

export const loadDraft = (): {
  content: string;
  type: PostActionType;
  timestamp: string;
} | null => {
  if (typeof window === 'undefined') return null;

  try {
    const draft = localStorage.getItem('post_draft');
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
};

export const clearDraft = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('post_draft');
  }
};

// Check if draft is recent (within 24 hours)
export const isDraftRecent = (timestamp: string): boolean => {
  const draftTime = new Date(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60);

  return hoursDiff < 24;
};
