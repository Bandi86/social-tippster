import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum VoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

export class CommentVoteDto {
  @ApiProperty({
    description: 'A szavazáshoz szükséges megjegyzés azonosítója',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  commentId: string;

  @ApiProperty({
    description: 'A szavazat típusa',
    enum: VoteType,
    example: 1,
  })
  @IsNotEmpty()
  @IsEnum(VoteType)
  value: VoteType;
}
