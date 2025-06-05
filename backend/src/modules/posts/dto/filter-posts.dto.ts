/**
 * FilterPostsDTO - Posztok szűrése
 * Frissítve: 2025.06.05
 * Megjegyzés: Tipp specifikus szűrők eltávolítva
 */

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PostStatus, PostType, PostVisibility } from '../enums/post.enums';

export class FilterPostsDTO {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUUID()
  author?: string;

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
  @IsDateString()
  createdAtFrom?: string;

  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @IsOptional()
  @IsDateString()
  updatedAtFrom?: string;

  @IsOptional()
  @IsDateString()
  updatedAtTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  likesCountMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  likesCountMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commentsCountMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commentsCountMax?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isReported?: boolean;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shareCountMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shareCountMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewsCountMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewsCountMax?: number;

  @IsOptional()
  @IsBoolean()
  sharingEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharingPlatforms?: string[];

  // Pagination
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Sorting
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
