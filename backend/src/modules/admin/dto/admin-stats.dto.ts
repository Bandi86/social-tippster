import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AdminStatsDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 150,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Number of active users',
    example: 120,
  })
  @IsNumber()
  active: number;

  @ApiProperty({
    description: 'Number of banned users',
    example: 5,
  })
  @IsNumber()
  banned: number;

  @ApiProperty({
    description: 'Number of unverified users',
    example: 25,
  })
  @IsNumber()
  unverified: number;

  @ApiProperty({
    description: 'Number of admin users',
    example: 2,
  })
  @IsNumber()
  admins: number;

  @ApiProperty({
    description: 'Number of recent registrations (last 7 days)',
    example: 10,
  })
  @IsNumber()
  recentRegistrations: number;
}
