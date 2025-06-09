import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUrl, MaxLength, MinLength, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
//import { PostType, PostVisibility } from '../entities/post.entity';

/* export class CreatePostDto {
  @ApiProperty({ example: 123 })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 'My Amazing Tipp' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'This is the content of my post...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @ApiProperty({ example: 'tipp', enum: PostType, required: false })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

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
}
 */
