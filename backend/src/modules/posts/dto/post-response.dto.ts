import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsObject } from 'class-validator';

export class PostResponseDto {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  visibility: string;
  category?: string;
  tags?: string[];

  // Tip-specific fields
  matchId?: string;
  bettingMarketId?: string;
  tipText?: string;
  odds?: number;
  stake?: number;
  confidence?: number;
  expiresAt?: Date;

  // Scheduling
  scheduledFor?: Date;

  // Interaction settings
  commentsEnabled: boolean;
  votingEnabled: boolean;
  sharingEnabled: boolean;

  // Premium features
  isPremium: boolean;
  isFeatured: boolean;
  isPinned: boolean;

  // Media
  imageUrls?: string[];

  // External links
  externalUrl?: string;
  externalTitle?: string;
  externalDescription?: string;
  externalImageUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Statistics
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;

  // Author information
  author: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
  };

  // User interaction (csak bejelentkezett felhasználóknál)
  userVote?: 'like' | 'dislike' | null;
  isBookmarked?: boolean;
  isFollowingAuthor?: boolean;
}

export class PaginationMetaDto {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  total: number;

  @IsNumber()
  totalPages: number;

  @IsNumber()
  hasNextPage: boolean;

  @IsNumber()
  hasPreviousPage: boolean;
}

export class GetPostsResponseDto {
  @IsArray()
  @Type(() => PostResponseDto)
  data: PostResponseDto[];

  @IsObject()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
