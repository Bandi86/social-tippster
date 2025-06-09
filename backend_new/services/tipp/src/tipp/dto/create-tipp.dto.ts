/* import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { TippType, TippConfidence, Sport } from '../entities/tipp.entity';

export class CreateTippDto {
  @ApiProperty({ example: 'Manchester United vs Chelsea' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Detailed analysis of the match...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'football', enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ example: 'Premier League' })
  @IsString()
  league: string;

  @ApiProperty({ example: 'Manchester United' })
  @IsString()
  homeTeam: string;

  @ApiProperty({ example: 'Chelsea' })
  @IsString()
  awayTeam: string;

  @ApiProperty({ example: 'match_result', enum: TippType })
  @IsEnum(TippType)
  type: TippType;

  @ApiProperty({ example: 'Manchester United to Win' })
  @IsString()
  prediction: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(1.01)
  @Max(1000)
  odds: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0.01)
  stake: number;

  @ApiProperty({ example: 'high', enum: TippConfidence })
  @IsEnum(TippConfidence)
  confidence: TippConfidence;

  @ApiProperty({ example: '2024-01-01T15:00:00Z' })
  @IsDateString()
  matchDate: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ example: ['injury-news', 'form-analysis'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'https://external-odds-provider.com/match/123' })
  @IsOptional()
  @IsString()
  oddsSource?: string;

  @ApiPropertyOptional({ example: { temperature: '15°C', weather: 'clear' } })
  @IsOptional()
  matchConditions?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Bet365' })
  @IsOptional()
  @IsString()
  bookmaker?: string;

  @ApiPropertyOptional({ example: 'BET123456' })
  @IsOptional()
  @IsString()
  betSlipId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isLive?: boolean;

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  winProbability?: number;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  valueRating?: number;
}
 */
