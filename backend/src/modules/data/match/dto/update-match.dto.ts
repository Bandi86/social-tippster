import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateMatchDto } from './create-match.dto';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {
  @ApiProperty({ description: 'Home team score', required: false })
  @IsNumber()
  @IsOptional()
  homeScore?: number;

  @ApiProperty({ description: 'Away team score', required: false })
  @IsNumber()
  @IsOptional()
  awayScore?: number;

  @ApiProperty({ description: 'Current minute of the match', required: false })
  @IsNumber()
  @IsOptional()
  minute?: number;

  @ApiProperty({ description: 'Half-time score (e.g., "1-0")', required: false })
  @IsString()
  @IsOptional()
  halfTimeScore?: string;

  @ApiProperty({ description: 'Full-time score (e.g., "2-1")', required: false })
  @IsString()
  @IsOptional()
  fullTimeScore?: string;
}
