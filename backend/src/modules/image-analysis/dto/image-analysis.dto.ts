import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TipCategory } from '../../posts/dto/create-post.dto';

export class ParsedTipDataDto {
  @ApiProperty({ description: 'Meccs neve', required: false })
  @IsOptional()
  @IsString()
  matchName?: string;

  @ApiProperty({ description: 'Meccs dátuma', required: false })
  @IsOptional()
  @IsString()
  matchDate?: string;

  @ApiProperty({ description: 'Meccs időpontja', required: false })
  @IsOptional()
  @IsString()
  matchTime?: string;

  @ApiProperty({ description: 'Tipp kategória', enum: TipCategory, required: false })
  @IsOptional()
  tipCategory?: TipCategory;

  @ApiProperty({ description: 'Tipp kimenetele', required: false })
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiProperty({ description: 'Odds érték', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1.01)
  @Max(100)
  odds?: number;

  @ApiProperty({ description: 'Össz odds érték', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1.01)
  @Max(100)
  totalOdds?: number;

  @ApiProperty({ description: 'Tét összege', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  stake?: number;

  @ApiProperty({ description: 'Bizalom szintje 1-5', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  confidence?: number;

  @ApiProperty({ description: 'Leadási határidő', required: false })
  @IsOptional()
  @IsString()
  submissionDeadline?: string;

  @ApiProperty({ description: 'Nyers OCR szöveg' })
  @IsString()
  rawText: string;

  @ApiProperty({ description: 'Kinyert entitások listája', type: [String] })
  @IsArray()
  @IsString({ each: true })
  extractedEntities: string[];

  @ApiProperty({ description: 'Bizalmi pontszám 0-1 között' })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence_score: number;
}

export class ValidationResultDto {
  @ApiProperty({ description: 'Validálás eredménye' })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({ description: 'Validálási hibák listája', type: [String] })
  @IsArray()
  @IsString({ each: true })
  errors: string[];
}

export class ImageAnalysisResultDto {
  @ApiProperty({ description: 'OCR-rel kinyert szöveg' })
  @IsString()
  extractedText: string;

  @ApiProperty({ description: 'Elemzett tipp adatok', type: ParsedTipDataDto })
  parsedData: ParsedTipDataDto;

  @ApiProperty({ description: 'Validálási eredmény', type: ValidationResultDto })
  validation: ValidationResultDto;

  @ApiProperty({ description: 'Elemzés bizalmi szintje 0-1 között' })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({ description: 'Javasolt poszt adatok', type: 'object', additionalProperties: true })
  suggestedPostData: any;
}

export class AnalyzeImageUrlDto {
  @ApiProperty({ description: 'Elemzendő kép URL-je' })
  @IsString()
  imageUrl: string;
}

export class ImageValidationResultDto {
  @ApiProperty({ description: 'A kép alkalmas-e OCR-re' })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({ description: 'Validálás eredményének leírása' })
  @IsString()
  message: string;
}

export class ImageAnalysisDebugDto {
  @ApiProperty({ description: 'Kép útvonala', required: false })
  @IsOptional()
  @IsString()
  imagePath?: string;

  @ApiProperty({ description: 'Kép létezik-e', required: false })
  @IsOptional()
  @IsBoolean()
  imageExists?: boolean;

  @ApiProperty({ description: 'Kinyert szöveg hossza', required: false })
  @IsOptional()
  @IsNumber()
  extractedTextLength?: number;

  @ApiProperty({ description: 'Kinyert szöveg előnézete', required: false })
  @IsOptional()
  @IsString()
  extractedTextPreview?: string;

  @ApiProperty({ description: 'Elemzett adatok összefoglalója', required: false })
  @IsOptional()
  parsedDataSummary?: {
    extractedEntities: string[];
    confidence: number;
    hasMatchName: boolean;
    hasOdds: boolean;
    hasOutcome: boolean;
  };

  @ApiProperty({ description: 'Teljes elemzett adatok', required: false })
  @IsOptional()
  fullParsedData?: ParsedTipDataDto;

  @ApiProperty({ description: 'Hiba üzenet', required: false })
  @IsOptional()
  @IsString()
  error?: string;
}
