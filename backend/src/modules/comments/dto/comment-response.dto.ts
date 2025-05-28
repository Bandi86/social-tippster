import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CommentUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  avatar?: string;

  @ApiPropertyOptional({ example: true })
  isVerified?: boolean;

  @ApiProperty({ example: 'john@example.com' })
  email: string;
}

export class CommentMentionedUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'jane_doe' })
  username: string;
}

export class CommentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Ez egy nagyszerű elemzés a mérkőzésről!' })
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  postId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  parentCommentId?: string;

  @ApiProperty({ type: CommentUserDto })
  user: CommentUserDto;

  @ApiProperty({ example: 5 })
  upvotes: number;

  @ApiProperty({ example: 1 })
  downvotes: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Current user vote: 1 for upvote, -1 for downvote, null for no vote',
  })
  userVote?: number | null;

  @ApiProperty({
    example: 3,
    description: 'Number of replies to this comment',
  })
  replyCount: number;

  @ApiPropertyOptional({
    example: 'Ez a hozzászólás megsértette a közösségi irányelveket',
  })
  flagReason?: string;

  @ApiProperty({
    example: '2023-05-25T14:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-25T14:30:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({ example: false })
  isDeleted?: boolean;

  @ApiPropertyOptional({
    example: '2023-05-25T15:00:00Z',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({ example: false })
  isEdited?: boolean;

  @ApiPropertyOptional({ example: [{ id: '...', username: '...' }] })
  mentionedUsers?: CommentMentionedUserDto[];

  @ApiPropertyOptional({ type: [CommentResponseDto] })
  replies?: CommentResponseDto[];
}
