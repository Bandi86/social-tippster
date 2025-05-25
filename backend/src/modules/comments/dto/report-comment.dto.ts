import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReportCommentDto {
  @ApiProperty({
    description: 'A bejelentendő hozzászólás azonosítója',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  commentId: string;

  @ApiProperty({
    description: 'A bejelentés oka',
    example: 'Ez a hozzászólás sértő nyelvezetet tartalmaz',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
