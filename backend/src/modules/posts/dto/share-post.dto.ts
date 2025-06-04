import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SharePlatform } from '../entities/post-share.entity';

export class SharePostDto {
  @IsEnum(SharePlatform)
  platform: SharePlatform;

  @IsOptional()
  @IsString()
  additional_data?: string; // JSON string for platform-specific data
}

export class SharePostResponseDto {
  success: boolean;
  shareUrl: string;
  shareId: string;
}
