import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PostStatus, PostType, PostVisibility } from './create-post.dto';

export enum PostSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TITLE = 'title',
  LIKES = 'likes',
  COMMENTS = 'comments',
  VIEWS = 'views',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetPostsQueryDto {
  // Pagination
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Az oldal száma minimum 1 lehet' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Az oldal mérete minimum 1 lehet' })
  @Max(100, { message: 'Az oldal mérete maximum 100 lehet' })
  limit?: number = 20;

  // Search
  @IsOptional()
  @IsString()
  search?: string;

  // Filters
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string | string[] }) =>
    typeof value === 'string' ? [value] : value,
  )
  tags?: string[];

  @IsOptional()
  @IsUUID('4', { message: 'Érvényes felhasználó ID szükséges' })
  authorId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Érvényes meccs ID szükséges' })
  matchId?: string;

  // Premium content filter
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPinned?: boolean;

  // Sorting
  @IsOptional()
  @IsEnum(PostSortBy)
  sortBy?: PostSortBy = PostSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  // Date filters
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @IsOptional()
  @IsString()
  createdBefore?: string;

  // Interaction filters
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  commentsEnabled?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  votingEnabled?: boolean;

  // Only for current user's posts
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  myPosts?: boolean;

  // Only followed users' posts
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  followedOnly?: boolean;
}
