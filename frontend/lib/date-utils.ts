/**
 * Dátum formázó segédfüggvények
 * Date formatting utility functions
 */

import { format, formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';

// Magyar: Relatív idő formázás (pl. "2 órája")
export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: hu,
  });
};

// Magyar: Pontos dátum formázás (pl. "2024. március 15. 14:30")
export const formatExactDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy. MMMM d. HH:mm', { locale: hu });
};

// Magyar: Rövid dátum formázás (pl. "márc. 15.")
export const formatShortDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM d.', { locale: hu });
};

// Magyar: Teljes dátum formázás (pl. "2024. március 15.")
export const formatFullDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy. MMMM d.', { locale: hu });
};

// Magyar: Idő formázás (pl. "14:30")
export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm');
};

// Magyar: Dátum validálás
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Magyar: Múltbeli dátum ellenőrzése
export const isPastDate = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};

// Magyar: Jövőbeli dátum ellenőrzése
export const isFutureDate = (date: string | Date): boolean => {
  return new Date(date) > new Date();
};
