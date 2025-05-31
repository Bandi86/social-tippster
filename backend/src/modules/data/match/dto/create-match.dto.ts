import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MatchStatus } from '../entities';

export class CreateMatchDto {
  @ApiProperty({ description: 'Home team ID' })
  @IsUUID()
  @IsNotEmpty()
  homeTeamId: string;

  @ApiProperty({ description: 'Away team ID' })
  @IsUUID()
  @IsNotEmpty()
  awayTeamId: string;

  @ApiProperty({ description: 'Match date and time' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ enum: MatchStatus, description: 'Match status', required: false })
  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;

  @ApiProperty({ description: 'Season ID', required: false })
  @IsUUID()
  @IsOptional()
  seasonId?: string;

  @ApiProperty({ description: 'Venue name', required: false })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiProperty({ description: 'Referee name', required: false })
  @IsString()
  @IsOptional()
  referee?: string;

  @ApiProperty({ description: 'Expected attendance', required: false })
  @IsNumber()
  @IsOptional()
  attendance?: number;

  @ApiProperty({ description: 'Weather conditions', required: false })
  @IsString()
  @IsOptional()
  weather?: string;
}
