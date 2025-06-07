/**
 * Post Module Enums
 * Frissítve: 2025.06.05
 * Refactoring alapján - separált a tipp specifikus enumoktól
 */

export enum PostType {
  GENERAL = 'general',
  DISCUSSION = 'discussion',
  ANALYSIS = 'analysis',
  HELP_REQUEST = 'help_request',
  NEWS = 'news',
  // MEGJEGYZÉS: TIP típus eltávolítva - a tipps modul kezeli
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  REPORTED = 'reported',
  PREMIUM = 'premium',
  INACTIVE = 'inactive',
}

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS_ONLY = 'followers_only',
  REGISTERED_ONLY = 'registered_only',
  PRIVATE = 'private',
  AUTHOR_ONLY = 'author_only',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
