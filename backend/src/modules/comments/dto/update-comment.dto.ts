import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'A hozzászólás tartalma, amelyet frissíteni szeretnél',
    example: 'Ez a hozzászólásom szerkesztett változata!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}
