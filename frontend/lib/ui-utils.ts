/**
 * UI komponensekhez kapcsolódó segédfüggvények
 * UI components related utility functions
 */

import { LucideIcon } from 'lucide-react';

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Empty state interface
export interface EmptyState {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Card wrapper props
export interface CardWrapperProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// Generic list item interface
export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  color?: string;
  onClick?: () => void;
}

// Button variants utility
export const getButtonVariant = (isSelected: boolean) => {
  return isSelected ? 'default' : 'ghost';
};

// Button class names utility
export const getButtonClassName = (isSelected: boolean, baseColor: string = 'amber') => {
  return isSelected
    ? `bg-${baseColor}-600 text-white`
    : `text-gray-400 hover:text-white hover:bg-${baseColor}-900/20`;
};

// Loading skeleton utility
export const getSkeletonItems = (count: number): null[] => {
  return Array(count).fill(null);
};

// Error message formatting
export const formatErrorMessage = (error: string | Error | null): string => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error.message || 'Ismeretlen hiba történt';
};

// Responsive grid classes
export const getGridClasses = (items: number): string => {
  if (items <= 2) return 'grid-cols-2';
  if (items <= 4) return 'grid-cols-2 lg:grid-cols-2';
  return 'grid-cols-2 lg:grid-cols-3';
};

// Color utilities for badges and indicators
export const getStatusColor = (status: string): string => {
  const colors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return colors[status as keyof typeof colors] || colors.info;
};

// Animation delay utility for staggered animations
export const getAnimationDelay = (index: number, baseDelay: number = 100): number => {
  return index * baseDelay;
};

// Truncate text utility
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Generate avatar fallback
export const getAvatarFallback = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format large numbers for display
export const formatDisplayNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

// Loading skeleton component props
export interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

// Empty state component props
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  className?: string;
}

// Card header with loading state props
export interface CardHeaderWithLoadingProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  isLoading?: boolean;
  badge?: string | number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// List container props
export interface ListContainerProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyState?: EmptyStateProps;
  className?: string;
  maxItems?: number;
}

// Debounce utility (can be used for search)
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Theme-aware classes
export const getThemeClasses = (darkMode: boolean = true) => {
  return {
    card: darkMode
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
      : 'bg-white border-gray-200',
    text: {
      primary: darkMode ? 'text-white' : 'text-gray-900',
      secondary: darkMode ? 'text-gray-400' : 'text-gray-600',
      accent: darkMode ? 'text-amber-400' : 'text-amber-600',
    },
    button: {
      primary: darkMode
        ? 'bg-amber-600 hover:bg-amber-700 text-white'
        : 'bg-amber-500 hover:bg-amber-600 text-white',
      secondary: darkMode
        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    },
  };
};
