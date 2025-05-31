import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from '../entities/match.entity';

export class LiveMatchResponseDto {
  @ApiProperty({ description: 'Match unique identifier' })
  id: string;

  @ApiProperty({ description: 'Home team name' })
  home_team: string;

  @ApiProperty({ description: 'Away team name' })
  away_team: string;

  @ApiProperty({ description: 'Home team score' })
  home_score: number;

  @ApiProperty({ description: 'Away team score' })
  away_score: number;

  @ApiProperty({
    enum: MatchStatus,
    description: 'Match status',
  })
  status: MatchStatus;

  @ApiProperty({
    description: 'Current match time (e.g., "67\'", "Q3 8:45")',
    nullable: true,
  })
  current_time?: string;

  @ApiProperty({ description: 'League name' })
  league: string;

  @ApiProperty({
    description: 'Sport type',
    enum: ['football', 'basketball', 'tennis', 'baseball'],
  })
  sport: string;

  @ApiProperty({ description: 'Match start time' })
  start_time: string;

  @ApiProperty({ description: 'Venue name', nullable: true })
  venue?: string;

  @ApiProperty({ description: 'Half time score', nullable: true })
  half_time_score?: string;
}
