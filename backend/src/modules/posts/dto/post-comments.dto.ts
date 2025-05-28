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
  MinLength,
} from 'class-validator';
import { CommentResponseDto } from '../../comments/dto/comment-response.dto';

export class CreateCommentDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;

  @IsString()
  @MinLength(1, { message: 'A komment nem lehet üres' })
  content: string;

  @IsOptional()
  @IsUUID('4', { message: 'Érvényes parent comment ID szükséges' })
  parentCommentId?: string; // For replies

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'A komment nem lehet üres' })
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}

export enum CommentSortBy {
  CREATED_AT = 'created_at',
  LIKES = 'likes',
  REPLIES = 'replies',
}

export enum CommentSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetCommentsQueryDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Az oldal száma minimum 1 lehet' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Az oldal mérete minimum 1 lehet' })
  @Max(50, { message: 'Az oldal mérete maximum 50 lehet' })
  limit?: number = 20;

  // Sorting
  @IsOptional()
  @IsEnum(CommentSortBy)
  sortBy?: CommentSortBy = CommentSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(CommentSortOrder)
  sortOrder?: CommentSortOrder = CommentSortOrder.DESC;

  // Filters
  @IsOptional()
  @IsUUID('4', { message: 'Érvényes parent comment ID szükséges' })
  parentCommentId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeReplies?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  onlyTopLevel?: boolean = false; // Only root comments, no replies
}

export class GetCommentsResponseDto {
  @IsArray()
  @Type(() => CommentResponseDto)
  data: CommentResponseDto[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class VoteCommentDto {
  @IsUUID('4', { message: 'Érvényes comment ID szükséges' })
  commentId: string;

  @IsEnum(['like', 'dislike'], { message: 'Érvényes vote típus szükséges' })
  type: 'like' | 'dislike';
}

export class UnvoteCommentDto {
  @IsUUID('4', { message: 'Érvényes comment ID szükséges' })
  commentId: string;
}
