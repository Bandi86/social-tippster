import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'az id-ja a hozzászólásnak, amelyhez kapcsolódik',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @ApiProperty({
    description: 'A hozzászólás tartalma',
    example: 'Ez egy nagyszerű elemzés a mérkőzésről!',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({
    description: 'A szülő hozzászólás azonosítója, ha ez egy válasz',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
