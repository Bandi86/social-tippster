import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { MatchEventType } from '../entities';

export class CreateMatchEventDto {
  @ApiProperty({ description: 'Match ID' })
  @IsUUID()
  @IsNotEmpty()
  matchId: string;

  @ApiProperty({ description: 'Minute when the event occurred' })
  @IsNumber()
  @IsNotEmpty()
  minute: number;

  @ApiProperty({ enum: MatchEventType, description: 'Type of event' })
  @IsEnum(MatchEventType)
  @IsNotEmpty()
  type: MatchEventType;

  @ApiProperty({ description: 'Player name', required: false })
  @IsString()
  @IsOptional()
  playerName?: string;

  @ApiProperty({ description: 'Assist by player', required: false })
  @IsString()
  @IsOptional()
  assistBy?: string;

  @ApiProperty({ description: 'Team ID', required: false })
  @IsNumber()
  @IsOptional()
  teamId?: number;

  @ApiProperty({ description: 'Event description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
