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
} from 'class-validator';
import { PostStatus, PostVisibility, TipCategory } from '../../posts/entities/posts.entity';

export class CreateTipDto {
  @IsString()
  @MinLength(1, { message: 'A cím nem lehet üres' })
  title: string;

  @IsString()
  @MinLength(1, { message: 'A tartalom nem lehet üres' })
  content: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.PUBLISHED;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility = PostVisibility.PUBLIC;

  @IsEnum(TipCategory, { message: 'Érvényes tip kategória szükséges' })
  tipCategory: TipCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string | string[] }) => (Array.isArray(value) ? value : [value]))
  tags?: string[];

  // Match Information
  @IsOptional()
  @IsUUID('4', { message: 'Érvényes meccs ID szükséges' })
  matchId?: string;

  @IsString()
  @MinLength(1, { message: 'A meccs neve nem lehet üres' })
  matchName: string;

  @IsDateString({}, { message: 'Érvényes meccs dátum szükséges' })
  matchDate: string;

  @IsOptional()
  @IsString()
  matchTime?: string;

  // Betting Information
  @IsString()
  @MinLength(1, { message: 'Az outcome nem lehet üres' })
  outcome: string;

  @IsNumber({}, { message: 'Az odds értéke szám kell legyen' })
  @Min(1.01, { message: 'Az odds értéke minimum 1.01 lehet' })
  @Max(1000, { message: 'Az odds értéke maximum 1000 lehet' })
  @Type(() => Number)
  odds: number;

  @IsNumber({}, { message: 'A tét értéke szám kell legyen' })
  @Min(1, { message: 'A tét minimum 1 lehet' })
  @Max(10, { message: 'A tét maximum 10 lehet' })
  @Type(() => Number)
  stake: number;

  @IsOptional()
  @IsNumber({}, { message: 'A total odds értéke szám kell legyen' })
  @Min(1.01, { message: 'A total odds értéke minimum 1.01 lehet' })
  @Type(() => Number)
  totalOdds?: number;

  @IsOptional()
  @IsNumber({}, { message: 'A confidence értéke szám kell legyen' })
  @Min(1, { message: 'A confidence minimum 1 lehet' })
  @Max(5, { message: 'A confidence maximum 5 lehet' })
  @Type(() => Number)
  confidence?: number;

  // Tip Management
  @IsOptional()
  @IsDateString({}, { message: 'Érvényes submission deadline formátum szükséges' })
  submissionDeadline?: string;

  // Post settings
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean = true;

  @IsOptional()
  @IsBoolean()
  votingEnabled?: boolean = true;

  @IsOptional()
  @IsBoolean()
  sharingEnabled?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  externalUrl?: string;
}
