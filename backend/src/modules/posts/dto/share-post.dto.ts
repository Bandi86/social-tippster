import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SharePlatform } from '../entities/post-share.entity';

export class SharePostDTO {
  @IsEnum(SharePlatform)
  platform: SharePlatform;

  @IsOptional()
  @IsString()
  additional_data?: string; // JSON string for platform-specific data
}

export class SharePostResponseDTO {
  success: boolean;
  shareUrl: string;
  shareId: string;
}
