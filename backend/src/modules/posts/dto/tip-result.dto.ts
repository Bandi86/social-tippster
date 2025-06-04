import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TipResult } from './create-post.dto';

export class SetTipResultDto {
  @IsEnum(TipResult, { message: 'Érvényes tip eredmény szükséges' })
  result: TipResult;

  @IsOptional()
  @IsNumber({}, { message: 'A profit értéke szám kell legyen' })
  profit?: number;
}

export class TipValidationResultDto {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class UserTipStatsDto {
  totalTips: number;
  wonTips: number;
  lostTips: number;
  pendingTips: number;
  winRate: number;
  totalProfit: number;
  averageOdds: number;
  bestStreak: number;
  currentStreak: number;
  monthlyStats?: MonthlyStatsDto[];
}

export class MonthlyStatsDto {
  month: string;
  year: number;
  totalTips: number;
  wonTips: number;
  profit: number;
  winRate: number;
}

export class LeaderboardEntryDto {
  userId: string;
  username: string;
  winRate: number;
  totalProfit: number;
  totalTips: number;
  rank: number;
  badge?: string;
}
