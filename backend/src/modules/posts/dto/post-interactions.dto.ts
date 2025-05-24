import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum VoteType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export class VotePostDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;

  @IsEnum(VoteType, { message: 'Érvényes vote típus szükséges (like/dislike)' })
  type: VoteType;
}

export class UnvotePostDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;
}

export class BookmarkPostDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;
}

export class UnbookmarkPostDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;
}

export class SharePostDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;

  @IsOptional()
  platform?: string; // facebook, twitter, telegram, etc.
}

export class ViewPostDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  postId: string;

  @IsOptional()
  duration?: number; // viewing duration in seconds
}
