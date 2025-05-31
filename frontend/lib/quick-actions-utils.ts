/**
 * Gyors műveletek segédfüggvények
 * Quick actions utility functions
 */

import {
  Bell,
  Bookmark,
  Calendar,
  LucideIcon,
  MessageSquare,
  Plus,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';

// Quick action types
export type QuickActionType =
  | 'create_post'
  | 'events'
  | 'groups'
  | 'leaderboard'
  | 'notifications'
  | 'bookmarks'
  | 'predictions'
  | 'settings';

// Quick action interface
export interface QuickAction {
  id: QuickActionType;
  label: string;
  icon: LucideIcon;
  description: string;
  href?: string;
  requiresAuth: boolean;
  isPrimary?: boolean;
  disabled?: boolean;
}

// Available quick actions for authenticated users
export const AUTHENTICATED_ACTIONS: QuickAction[] = [
  {
    id: 'create_post',
    label: 'Új poszt',
    icon: Plus,
    description: 'Új poszt, tipp vagy elemzés létrehozása',
    requiresAuth: true,
    isPrimary: true,
  },
  {
    id: 'events',
    label: 'Események',
    icon: Calendar,
    description: 'Közelgő meccsek és események',
    href: '/events',
    requiresAuth: true,
  },
  {
    id: 'groups',
    label: 'Csoportok',
    icon: Users,
    description: 'Csatlakozás közösségekhez',
    href: '/groups',
    requiresAuth: true,
  },
  {
    id: 'leaderboard',
    label: 'Rangsor',
    icon: Trophy,
    description: 'Legjobb tipperek rangsora',
    href: '/leaderboard',
    requiresAuth: true,
  },
  {
    id: 'notifications',
    label: 'Értesítések',
    icon: Bell,
    description: 'Legfrissebb értesítések',
    href: '/notifications',
    requiresAuth: true,
  },
  {
    id: 'bookmarks',
    label: 'Mentett posztok',
    icon: Bookmark,
    description: 'Elmentett posztok és tippek',
    href: '/bookmarks',
    requiresAuth: true,
  },
];

// Features available for unauthenticated users to see what they can access
export const PREVIEW_FEATURES = [
  {
    icon: Plus,
    label: 'Új posztok létrehozása',
    description: 'Oszd meg tippjeidet és elemzéseidet',
  },
  {
    icon: MessageSquare,
    label: 'Kommentelés és válaszadás',
    description: 'Beszélgess más felhasználókkal',
  },
  {
    icon: TrendingUp,
    label: 'Szavazás és értékelés',
    description: 'Értékeld mások tippjeit',
  },
  {
    icon: Bookmark,
    label: 'Posztok mentése',
    description: 'Mentsd el a legjobb tippeket',
  },
  {
    icon: Star,
    label: 'Személyes rangsor',
    description: 'Kövesd a teljesítményedet',
  },
  {
    icon: Target,
    label: 'Prognózisok követése',
    description: 'Tartsd nyilván a tippjeidet',
  },
];

// Get action by id
export const getQuickAction = (id: QuickActionType): QuickAction | undefined => {
  return AUTHENTICATED_ACTIONS.find(action => action.id === id);
};

// Get primary actions (most important ones)
export const getPrimaryActions = (): QuickAction[] => {
  return AUTHENTICATED_ACTIONS.filter(action => action.isPrimary);
};

// Get secondary actions (additional features)
export const getSecondaryActions = (): QuickAction[] => {
  return AUTHENTICATED_ACTIONS.filter(action => !action.isPrimary);
};

// Action button styles
export const getActionButtonStyles = (isPrimary: boolean = false): string => {
  if (isPrimary) {
    return 'w-full bg-amber-600 hover:bg-amber-700 text-white';
  }

  return 'w-full border-amber-600 text-amber-400 hover:bg-amber-900/20';
};

// Get action icon color
export const getActionIconColor = (isPrimary: boolean = false): string => {
  return isPrimary ? 'text-white' : 'text-amber-400';
};

// Navigation handlers
export const handleQuickAction = (
  action: QuickAction,
  customHandlers?: Partial<Record<QuickActionType, () => void>>,
): void => {
  // Check for custom handler first
  if (customHandlers?.[action.id]) {
    customHandlers[action.id]!();
    return;
  }

  // Default navigation behavior
  if (action.href) {
    window.location.href = action.href;
  } else {
    console.log(`No handler defined for action: ${action.id}`);
  }
};

// Action availability check
export const isActionAvailable = (action: QuickAction, isAuthenticated: boolean): boolean => {
  if (action.disabled) return false;
  if (action.requiresAuth && !isAuthenticated) return false;

  return true;
};

// Group actions by category
export const groupActionsByCategory = () => {
  return {
    content: AUTHENTICATED_ACTIONS.filter(action =>
      ['create_post', 'bookmarks'].includes(action.id),
    ),
    social: AUTHENTICATED_ACTIONS.filter(action => ['groups', 'notifications'].includes(action.id)),
    competitions: AUTHENTICATED_ACTIONS.filter(action =>
      ['events', 'leaderboard'].includes(action.id),
    ),
  };
};

// Analytics tracking for quick actions
export const trackQuickAction = (actionId: QuickActionType): void => {
  // This could be enhanced to send analytics data
  console.log(`Quick action performed: ${actionId}`);
};

// Quick action shortcuts (keyboard shortcuts could be added later)
export const QUICK_ACTION_SHORTCUTS = {
  create_post: 'Ctrl+N',
  events: 'Ctrl+E',
  notifications: 'Ctrl+B',
} as const;

// Get available actions for current user
export const getAvailableActions = (
  isAuthenticated: boolean,
  customActions?: QuickAction[],
): QuickAction[] => {
  const baseActions = customActions || AUTHENTICATED_ACTIONS;

  return baseActions.filter(action => isActionAvailable(action, isAuthenticated));
};
