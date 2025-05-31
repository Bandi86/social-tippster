import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateMatchStatDto {
  @ApiProperty({
    description: 'ID of the team',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  teamId: string;

  @ApiProperty({
    description: 'Ball possession percentage',
    example: 65,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  possession?: number;

  @ApiProperty({
    description: 'Total shots',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shots?: number;

  @ApiProperty({
    description: 'Shots on target',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shotsOnTarget?: number;

  @ApiProperty({
    description: 'Total passes',
    example: 450,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  passes?: number;

  @ApiProperty({
    description: 'Pass accuracy percentage',
    example: 88.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  passAccuracy?: number;

  @ApiProperty({
    description: 'Number of fouls',
    example: 8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fouls?: number;

  @ApiProperty({
    description: 'Number of yellow cards',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yellowCards?: number;

  @ApiProperty({
    description: 'Number of red cards',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  redCards?: number;

  @ApiProperty({
    description: 'Number of corners',
    example: 6,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  corners?: number;

  @ApiProperty({
    description: 'Number of offsides',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offsides?: number;
}
