import { IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class PostStatsDto {
  @IsUUID('4')
  postId: string;

  @IsNumber()
  likesCount: number;

  @IsNumber()
  dislikesCount: number;

  @IsNumber()
  commentsCount: number;

  @IsNumber()
  sharesCount: number;

  @IsNumber()
  viewsCount: number;

  @IsNumber()
  bookmarksCount: number;

  @IsOptional()
  @IsNumber()
  engagementRate?: number; // Calculated field

  @IsOptional()
  @IsDateString()
  lastViewAt?: string;

  @IsOptional()
  @IsDateString()
  lastInteractionAt?: string;
}

export class UserPostInteractionDto {
  @IsUUID('4')
  userId: string;

  @IsUUID('4')
  postId: string;

  @IsOptional()
  @IsString()
  voteType?: 'like' | 'dislike' | null;

  @IsOptional()
  isBookmarked?: boolean;

  @IsOptional()
  hasShared?: boolean;

  @IsOptional()
  @IsNumber()
  viewCount?: number;

  @IsOptional()
  @IsDateString()
  lastViewAt?: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;
}

export class PostAnalyticsDto {
  @IsUUID('4')
  postId: string;

  // Daily stats for the last 30 days
  dailyViews: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;

  // Peak performance metrics
  peakViewsDay: string;
  peakLikesDay: string;
  totalEngagement: number;
  averageDailyViews: number;

  // Audience insights
  topCountries: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;

  topDevices: Array<{
    device: string;
    views: number;
    percentage: number;
  }>;

  // Performance compared to author's other posts
  relativePerformance: {
    viewsPercentile: number;
    likesPercentile: number;
    commentsPercentile: number;
  };
}
