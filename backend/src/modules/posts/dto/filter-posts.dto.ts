import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipCategory } from '../entities/posts.entity';

export class FilterPostsDto {
  @ApiPropertyOptional({
    description: 'Filter by post category',
    enum: TipCategory,
  })
  @IsOptional()
  @IsEnum(TipCategory)
  category?: TipCategory;

  @ApiPropertyOptional({
    description: 'Filter by post type (tip/prediction)',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter posts from this date onwards',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter posts up to this date',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Minimum number of likes',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLikes?: number;

  @ApiPropertyOptional({
    description: 'Filter by tip result',
  })
  @IsOptional()
  @IsString()
  tipResult?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Number of results to skip',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number = 0;
}

export class SearchPostsDto {
  @ApiPropertyOptional({
    description: 'Search query string',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Number of results to skip',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number = 0;
}

export class PostsWithTotalResponse {
  @ApiPropertyOptional({
    description: 'Array of posts',
    type: [Object],
  })
  posts: any[];

  @ApiPropertyOptional({
    description: 'Total number of posts',
    type: Number,
  })
  total: number;
}
