/**
 * Authentikációhoz kapcsolódó segédfüggvények
 * Authentication related utility functions
 */

import { toast } from '@/hooks/use-toast';

// Magyar: Bejelentkezés kötelező üzenet típusok
export const AUTH_MESSAGES = {
  vote: {
    title: 'Bejelentkezés szükséges',
    description: 'A szavazáshoz be kell jelentkezni',
  },
  bookmark: {
    title: 'Bejelentkezés szükséges',
    description: 'A könyvjelzőzéshez be kell jelentkezni',
  },
  comment: {
    title: 'Bejelentkezés szükséges',
    description: 'A kommenteléshez be kell jelentkezni',
  },
  share: {
    title: 'Bejelentkezés szükséges',
    description: 'A megosztáshoz be kell jelentkezni',
  },
  follow: {
    title: 'Bejelentkezés szükséges',
    description: 'A követéshez be kell jelentkezni',
  },
  create: {
    title: 'Bejelentkezés szükséges',
    description: 'Tartalom létrehozásához be kell jelentkezni',
  },
} as const;

// Magyar: Authentikáció ellenőrzés és hibaüzenet megjelenítés
export const requireAuth = (
  isAuthenticated: boolean,
  action: keyof typeof AUTH_MESSAGES,
  callback?: () => void,
): boolean => {
  if (!isAuthenticated) {
    const message = AUTH_MESSAGES[action];
    toast({
      title: message.title,
      description: message.description,
      variant: 'destructive',
    });
    return false;
  }

  if (callback) {
    callback();
  }

  return true;
};

// Magyar: Admin jogosultság ellenőrzése
export const requireAdmin = (userRole: string | undefined, callback?: () => void): boolean => {
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    toast({
      title: 'Nincs jogosultság',
      description: 'Admin jogosultság szükséges ehhez a művelethez',
      variant: 'destructive',
    });
    return false;
  }

  if (callback) {
    callback();
  }

  return true;
};

// Magyar: Moderátor jogosultság ellenőrzése
export const requireModerator = (userRole: string | undefined, callback?: () => void): boolean => {
  const allowedRoles = ['admin', 'super_admin', 'moderator'];
  if (!allowedRoles.includes(userRole || '')) {
    toast({
      title: 'Nincs jogosultság',
      description: 'Moderátor jogosultság szükséges ehhez a művelethez',
      variant: 'destructive',
    });
    return false;
  }

  if (callback) {
    callback();
  }

  return true;
};

// Magyar: Saját tartalom ellenőrzése
export const isOwnContent = (
  currentUserId: string | undefined,
  contentUserId: string | undefined,
): boolean => {
  return !!(currentUserId && contentUserId && currentUserId === contentUserId);
};

// Magyar: Szerkesztési jogosultság ellenőrzése
export const canEdit = (
  currentUserId: string | undefined,
  contentUserId: string | undefined,
  userRole: string | undefined,
): boolean => {
  // Admin és moderátor mindig szerkeszthet
  const isModeratorOrAdmin = ['admin', 'super_admin', 'moderator'].includes(userRole || '');

  // Saját tartalom szerkesztése
  const isOwner = isOwnContent(currentUserId, contentUserId);

  return isModeratorOrAdmin || isOwner;
};

// Magyar: Törlési jogosultság ellenőrzése
export const canDelete = (
  currentUserId: string | undefined,
  contentUserId: string | undefined,
  userRole: string | undefined,
): boolean => {
  // Ugyanaz mint a szerkesztés
  return canEdit(currentUserId, contentUserId, userRole);
};
