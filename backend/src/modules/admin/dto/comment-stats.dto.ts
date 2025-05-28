import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CommentStatsDto {
  @ApiProperty({
    description: 'Total number of comments',
    example: 350,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Number of active comments',
    example: 300,
  })
  @IsNumber()
  active: number;

  @ApiProperty({
    description: 'Number of flagged comments',
    example: 25,
  })
  @IsNumber()
  flagged: number;

  @ApiProperty({
    description: 'Number of reported comments',
    example: 10,
  })
  @IsNumber()
  reported: number;

  @ApiProperty({
    description: 'Number of recent comments (last 7 days)',
    example: 45,
  })
  @IsNumber()
  recentComments: number;
}
