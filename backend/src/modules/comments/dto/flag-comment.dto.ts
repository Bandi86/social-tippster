import { IsNotEmpty, IsUUID, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FlagCommentDto {
  @ApiProperty({
    description: 'aA megjelölendő megjegyzés azonosítója',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  commentId: string;

  @ApiProperty({
    description: 'A megjegyzés megjelölésének oka',
    example: 'Ez a megjegyzés sértő nyelvezetet tartalmaz',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
