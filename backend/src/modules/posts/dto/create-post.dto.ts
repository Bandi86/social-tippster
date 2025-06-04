import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export enum PostType {
  TIP = 'tip',
  GENERAL = 'general',
  DISCUSSION = 'discussion',
  ANALYSIS = 'analysis',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  REPORTED = 'reported',
}

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
}

export enum TipCategory {
  SINGLE_BET = 'single_bet',
  COMBO_BET = 'combo_bet',
  SYSTEM_BET = 'system_bet',
  LIVE_BET = 'live_bet',
}

export enum TipResult {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  VOID = 'void',
  HALF_WON = 'half_won',
  HALF_LOST = 'half_lost',
}

export class CreatePostDto {
  @IsString()
  @MinLength(1, { message: 'A cím nem lehet üres' })
  title: string;

  @IsString()
  @MinLength(1, { message: 'A tartalom nem lehet üres' })
  content: string;

  @IsEnum(PostType)
  type: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.PUBLISHED;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility = PostVisibility.PUBLIC;

  @IsOptional()
  @IsString()
  category?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsEnum(TipCategory, { message: 'Érvényes tip kategória szükséges' })
  tipCategory?: TipCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string | string[] }) => (Array.isArray(value) ? value : [value]))
  tags?: string[];

  // Tip-specifikus mezők
  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsUUID('4', { message: 'Érvényes meccs ID szükséges' })
  matchId?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsString()
  @MinLength(1, { message: 'A meccs neve nem lehet üres' })
  matchName?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsDateString({}, { message: 'Érvényes meccs dátum szükséges' })
  matchDate?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsString()
  matchTime?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsString()
  @MinLength(1, { message: 'Az outcome nem lehet üres' })
  outcome?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsUUID('4', { message: 'Érvényes betting market ID szükséges' })
  bettingMarketId?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsString()
  @MinLength(1, { message: 'A tipp szövege nem lehet üres' })
  tipText?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsNumber({}, { message: 'Az odds értéke szám kell legyen' })
  @Min(1.01, { message: 'Az odds értéke minimum 1.01 lehet' })
  @Max(1000, { message: 'Az odds értéke maximum 1000 lehet' })
  @Type(() => Number)
  odds?: number;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsOptional()
  @IsNumber({}, { message: 'A total odds értéke szám kell legyen' })
  @Min(1.01, { message: 'A total odds értéke minimum 1.01 lehet' })
  @Type(() => Number)
  totalOdds?: number;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsNumber({}, { message: 'A tét értéke szám kell legyen' })
  @Min(1, { message: 'A tét minimum 1 lehet' })
  @Max(10, { message: 'A tét maximum 10 lehet' })
  @Type(() => Number)
  stake?: number;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsNumber({}, { message: 'A confidence értéke szám kell legyen' })
  @Min(1, { message: 'A confidence minimum 1 lehet' })
  @Max(5, { message: 'A confidence maximum 5 lehet' })
  @Type(() => Number)
  confidence?: number;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsOptional()
  @IsDateString({}, { message: 'Érvényes dátum formátum szükséges' })
  expiresAt?: string;

  @ValidateIf((o: CreatePostDto) => o.type === PostType.TIP)
  @IsOptional()
  @IsDateString({}, { message: 'Érvényes submission deadline formátum szükséges' })
  submissionDeadline?: string;

  // Post ütemezés
  @IsOptional()
  @IsDateString({}, { message: 'Érvényes dátum formátum szükséges' })
  scheduledFor?: string;

  // Kommentek és interakciók
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean = true;

  @IsOptional()
  @IsBoolean()
  votingEnabled?: boolean = true;

  @IsOptional()
  @IsBoolean()
  sharingEnabled?: boolean = true;

  // Prémium tartalom
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;

  // Képek - külön fájl feltöltésen keresztül kezelve
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  // Külső linkek
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsString()
  externalTitle?: string;

  @IsOptional()
  @IsString()
  externalDescription?: string;

  @IsOptional()
  @IsString()
  externalImageUrl?: string;
}
