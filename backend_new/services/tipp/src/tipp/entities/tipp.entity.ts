/* // Tipp entity - To be implemented with Prisma
// This file has been cleared for Prisma-only implementation
import { ApiProperty } from '@nestjs/swagger';

export enum TippType {
  MATCH_RESULT = 'match_result',
  OVER_UNDER = 'over_under',
  BOTH_TEAMS_SCORE = 'both_teams_score',
  ASIAN_HANDICAP = 'asian_handicap',
  CORRECT_SCORE = 'correct_score',
  FIRST_GOAL_SCORER = 'first_goal_scorer',
  TOTAL_GOALS = 'total_goals',
  HALF_TIME_RESULT = 'half_time_result',
  DOUBLE_CHANCE = 'double_chance',
  CUSTOM = 'custom',
}

export enum TippStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  VOID = 'void',
  PARTIALLY_WON = 'partially_won',
  PUSHED = 'pushed',
}

export enum TippConfidence {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  BANKER = 'banker',
}

export enum Sport {
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
  TENNIS = 'tennis',
  BASEBALL = 'baseball',
  HOCKEY = 'hockey',
  SOCCER = 'soccer',
  AMERICAN_FOOTBALL = 'american_football',
  CRICKET = 'cricket',
  RUGBY = 'rugby',
  GOLF = 'golf',
  OTHER = 'other',
}

@Entity('tipps')
@Index('idx_user_id', ['userId'])
@Index('idx_match_date', ['matchDate'])
@Index('idx_status', ['status'])
@Index('idx_sport_league', ['sport', 'league'])
export class Tipp {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 123 })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ example: 'Manchester United vs Chelsea' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ example: 'Detailed analysis of the match...' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 'football', enum: Sport })
  @Column({
    type: 'enum',
    enum: Sport,
    default: Sport.FOOTBALL,
  })
  sport: Sport;

  @ApiProperty({ example: 'Premier League' })
  @Column({ length: 100 })
  league: string;

  @ApiProperty({ example: 'Manchester United' })
  @Column({ length: 100 })
  homeTeam: string;

  @ApiProperty({ example: 'Chelsea' })
  @Column({ length: 100 })
  awayTeam: string;

  @ApiProperty({ example: 'match_result', enum: TippType })
  @Column({
    type: 'enum',
    enum: TippType,
    default: TippType.MATCH_RESULT,
  })
  type: TippType;

  @ApiProperty({ example: 'Manchester United to Win' })
  @Column({ length: 255 })
  prediction: string;

  @ApiProperty({ example: 2.5 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  odds: number;

  @ApiProperty({ example: 100 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stake: number;

  @ApiProperty({ example: 250 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  potentialReturn: number;

  @ApiProperty({ example: 'high', enum: TippConfidence })
  @Column({
    type: 'enum',
    enum: TippConfidence,
    default: TippConfidence.MEDIUM,
  })
  confidence: TippConfidence;

  @ApiProperty({ example: 'pending', enum: TippStatus })
  @Column({
    type: 'enum',
    enum: TippStatus,
    default: TippStatus.PENDING,
  })
  status: TippStatus;

  @ApiProperty({ example: '2024-01-01T15:00:00Z' })
  @Column()
  matchDate: Date;

  @ApiProperty({ example: '1-2' })
  @Column({ nullable: true, length: 50 })
  actualResult?: string;

  @ApiProperty({ example: 150 })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualReturn?: number;

  @ApiProperty({ example: 50 })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  profit?: number;

  @ApiProperty({ example: 25 })
  @Column({ default: 0 })
  likesCount: number;

  @ApiProperty({ example: 5 })
  @Column({ default: 0 })
  commentsCount: number;

  @ApiProperty({ example: 10 })
  @Column({ default: 0 })
  followersCount: number;

  @ApiProperty({ example: 100 })
  @Column({ default: 0 })
  viewsCount: number;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isPremium: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty({ example: ['injury-news', 'form-analysis'] })
  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @ApiProperty({ example: 'https://external-odds-provider.com/match/123' })
  @Column({ nullable: true, length: 500 })
  oddsSource?: string;

  @ApiProperty({ example: { temperature: '15°C', weather: 'clear' } })
  @Column({ type: 'json', nullable: true })
  matchConditions?: Record<string, any>;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ example: '2024-01-01T18:00:00Z' })
  @Column({ nullable: true })
  settledAt?: Date;

  // Additional betting specific fields
  @ApiProperty({ example: 'Bet365' })
  @Column({ nullable: true, length: 100 })
  bookmaker?: string;

  @ApiProperty({ example: 'BET123456' })
  @Column({ nullable: true, length: 100 })
  betSlipId?: string;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isLive: boolean;

  @ApiProperty({ example: 75.5 })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  winProbability?: number;

  @ApiProperty({ example: 8.5 })
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  valueRating?: number;
} */
