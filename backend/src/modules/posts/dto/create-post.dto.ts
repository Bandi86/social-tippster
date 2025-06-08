/**
 * CreatePostDTO - Új poszt létrehozása
 * Frissítve: 2025.06.05
 * Megjegyzés: Minden tipp specifikus mező eltávolítva
 */

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PostStatus, PostType, PostVisibility } from '../enums/post.enums';

export class CreatePostDTO {
  @IsString()
  @MinLength(1, { message: 'Content cannot be empty' })
  @MaxLength(10000, { message: 'Content is too long' })
  content: string;

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType = PostType.DISCUSSION;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.PUBLISHED;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility = PostVisibility.PUBLIC;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateIf((o: CreatePostDTO) => o.imageUrl !== undefined && o.imageUrl !== '')
  @Matches(/^(https?:\/\/(localhost(:\d+)?|[\w.-]+\.[a-z]{2,})(\/.*)?|\/uploads\/.*)$/i, {
    message: 'Invalid URL format. Must be a valid HTTP/HTTPS URL or upload path.',
  })
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean = false;

  @IsOptional()
  @IsBoolean()
  sharingEnabled?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharingPlatforms?: string[];

  // Megjegyzés: title automatikusan generálódik a content alapján
  // Megjegyzés: authorId, createdBy automatikusan beállítódik a backend-en
  // Megjegyzés: minden tipp specifikus mező eltávolítva
}

export { PostStatus, PostType, PostVisibility };
