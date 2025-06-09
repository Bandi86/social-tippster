/* import { IsString, IsOptional, IsEnum, IsArray, IsUrl, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostType, PostStatus, PostVisibility } from '../entities/post.entity';

export class UpdatePostDto {
  @ApiProperty({ example: 'My Updated Tipp', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiProperty({ example: 'Updated content...', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @ApiProperty({ example: 'tipp', enum: PostType, required: false })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiProperty({ example: 'published', enum: PostStatus, required: false })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ example: 'public', enum: PostVisibility, required: false })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiProperty({ example: ['football', 'premier-league'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: ['https://example.com/image1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiProperty({ example: 'https://example.com/external-link', required: false })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  externalLink?: string;

  @ApiProperty({ example: 'football-match-123', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiProperty({ example: 'This is a brief excerpt...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ example: { location: 'London' }, required: false })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsOptional()
  scheduledAt?: Date;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPromoted?: boolean;
}
 */
