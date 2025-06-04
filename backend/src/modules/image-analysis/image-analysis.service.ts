import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { CreatePostDto, TipCategory } from '../posts/dto/create-post.dto';
import { CreateTipDto } from '../tipps/dto/create-tip.dto';
import { Post, PostType } from '../posts/entities/posts.entity';
import { ImageProcessingService } from './image-processing.service';
import { OcrService } from './ocr.service';
import { ParsedTipData, TipDataParserService } from './tip-data-parser.service';

export interface ImageAnalysisResult {
  extractedText: string;
  parsedData: ParsedTipData;
  validation: {
    isValid: boolean;
    errors: string[];
  };
  confidence: number;
  suggestedPostData: Partial<CreatePostDto>;
}

export interface MatchData {
  matchName: string;
  matchDate: string;
  matchTime?: string;
}

export interface BettingSlipData {
  extractedText: string;
  odds?: number;
  stake?: number;
  outcome?: string;
  tipCategory?: TipCategory;
  confidence?: number;
}

@Injectable()
export class ImageAnalysisService {
  private readonly logger = new Logger(ImageAnalysisService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly ocrService: OcrService,
    private readonly tipDataParserService: TipDataParserService,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  /**
   * Fő funkció: kép elemzése és tipp adatok kinyerése
   */
  async analyzeImageForTip(imagePath: string): Promise<ImageAnalysisResult> {
    try {
      this.logger.log(`Starting image analysis for: ${imagePath}`);

      // 1. OCR - szöveg kinyerése a képből (delegálva az uploads modulnak)
      const processedImage = await this.imageProcessingService.preprocessImage(imagePath);
      const extractedText = await this.imageProcessingService.extractTextFromImage(processedImage);

      if (!extractedText || extractedText.trim().length < 10) {
        throw new BadRequestException('Nem sikerült értelmezhető szöveget kinyerni a képből');
      }

      // 2. Szöveg elemzése és tipp adatok parsing
      const parsedData = this.tipDataParserService.parseTipData(extractedText);

      // 3. Validálás
      const validation = this.tipDataParserService.validateParsedData(parsedData);

      // 4. CreatePostDto generálása az elemzett adatok alapján
      const suggestedPostData = this.generateSuggestedPostData(parsedData);

      const result: ImageAnalysisResult = {
        extractedText,
        parsedData,
        validation,
        confidence: parsedData.confidence_score,
        suggestedPostData,
      };

      this.logger.log(`Image analysis completed with confidence: ${result.confidence}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Image analysis failed: ${error.message}`, error.stack);
        throw new BadRequestException(`Képelemzés sikertelen: ${error.message}`);
      } else {
        this.logger.error('Image analysis failed', String(error));
        throw new BadRequestException('Képelemzés sikertelen');
      }
    }
  }

  /**
   * Buffer-ből történő képelemzés
   */
  async analyzeImageBufferForTip(imageBuffer: Buffer): Promise<ImageAnalysisResult> {
    try {
      this.logger.log('Starting image analysis from buffer');

      // 1. OCR - szöveg kinyerése a buffer-ből
      const extractedText = await this.ocrService.extractTextFromBuffer(imageBuffer);

      if (!extractedText || extractedText.trim().length < 10) {
        throw new BadRequestException('Nem sikerült értelmezhető szöveget kinyerni a képből');
      }

      // 2. Szöveg elemzése és tipp adatok parsing
      const parsedData = this.tipDataParserService.parseTipData(extractedText);

      // 3. Validálás
      const validation = this.tipDataParserService.validateParsedData(parsedData);

      // 4. CreatePostDto generálása az elemzett adatok alapján
      const suggestedPostData = this.generateSuggestedPostData(parsedData);

      const result: ImageAnalysisResult = {
        extractedText,
        parsedData,
        validation,
        confidence: parsedData.confidence_score,
        suggestedPostData,
      };

      this.logger.log(`Image analysis completed with confidence: ${result.confidence}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Image analysis failed: ${error.message}`, error.stack);
        throw new BadRequestException(`Képelemzés sikertelen: ${error.message}`);
      } else {
        this.logger.error('Image analysis failed', String(error));
        throw new BadRequestException('Képelemzés sikertelen');
      }
    }
  }

  /**
   * CreatePostDto generálása az elemzett adatok alapján
   */
  private generateSuggestedPostData(parsedData: ParsedTipData): Partial<CreatePostDto> {
    const suggestedData: Partial<CreatePostDto> = {
      type: PostType.TIP,
      title: this.generateTipTitle(parsedData),
      content: this.generateTipContent(parsedData),
    };

    // Tipp-specifikus mezők hozzáadása ha rendelkezésre állnak
    if (parsedData.matchName) {
      suggestedData['match_name'] = parsedData.matchName;
    }

    if (parsedData.matchDate) {
      try {
        suggestedData['match_date'] = new Date(parsedData.matchDate);
      } catch {
        this.logger.warn(`Invalid match date format: ${parsedData.matchDate}`);
      }
    }

    if (parsedData.matchTime) {
      suggestedData['match_time'] = parsedData.matchTime;
    }

    if (parsedData.odds) {
      suggestedData['odds'] = parsedData.odds;
    }

    if (parsedData.totalOdds) {
      suggestedData['total_odds'] = parsedData.totalOdds;
    }

    if (parsedData.stake) {
      suggestedData['stake'] = parsedData.stake;
    }

    if (parsedData.confidence) {
      suggestedData['confidence'] = parsedData.confidence;
    }

    if (parsedData.outcome) {
      suggestedData['outcome'] = parsedData.outcome;
    }

    if (parsedData.tipCategory) {
      suggestedData['tip_category'] = parsedData.tipCategory;
    }

    if (parsedData.submissionDeadline) {
      try {
        suggestedData['submission_deadline'] = new Date(parsedData.submissionDeadline);
      } catch {
        this.logger.warn(`Invalid submission deadline format: ${parsedData.submissionDeadline}`);
      }
    }

    return suggestedData;
  }

  /**
   * Tipp cím generálása
   */
  private generateTipTitle(parsedData: ParsedTipData): string {
    if (parsedData.matchName && parsedData.outcome) {
      return `Tipp: ${parsedData.matchName} - ${parsedData.outcome}`;
    }

    if (parsedData.matchName) {
      return `Tipp: ${parsedData.matchName}`;
    }

    if (parsedData.outcome) {
      return `Tipp: ${parsedData.outcome}`;
    }

    return 'Automatikusan generált tipp';
  }

  /**
   * Tipp tartalom generálása
   */
  private generateTipContent(parsedData: ParsedTipData): string {
    let content = '🤖 **Automatikusan elemzett tipp**\n\n';

    if (parsedData.matchName) {
      content += `**Meccs:** ${parsedData.matchName}\n`;
    }

    if (parsedData.outcome) {
      content += `**Tipp:** ${parsedData.outcome}\n`;
    }

    if (parsedData.odds) {
      content += `**Odds:** ${parsedData.odds}\n`;
    }

    if (parsedData.stake) {
      content += `**Tét:** ${parsedData.stake}\n`;
    }

    if (parsedData.confidence) {
      content += `**Bizalom:** ${parsedData.confidence}/5\n`;
    }

    if (parsedData.matchDate && parsedData.matchTime) {
      content += `**Időpont:** ${parsedData.matchDate} ${parsedData.matchTime}\n`;
    } else if (parsedData.matchDate) {
      content += `**Dátum:** ${parsedData.matchDate}\n`;
    }

    content += `\n**Elemzés biztonsága:** ${Math.round(parsedData.confidence_score * 100)}%\n`;

    if (parsedData.extractedEntities.length > 0) {
      content += `**Kinyert adatok:** ${parsedData.extractedEntities.join(', ')}\n`;
    }

    content += '\n*Kérjük, ellenőrizd az automatikusan kinyert adatokat a közzététel előtt!*';

    return content;
  }

  /**
   * Kép fájl ellenőrzése
   */
  validateImageFile(filePath: string): boolean {
    try {
      const fullPath = path.resolve(filePath);

      // Fájl létezésének ellenőrzése
      if (!fs.existsSync(fullPath)) {
        return false;
      }

      // Fájl típus ellenőrzése (képek)
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'];
      const fileExtension = path.extname(fullPath).toLowerCase();

      return allowedExtensions.includes(fileExtension);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Image validation failed: ${error.message}`);
        return false;
      } else {
        this.logger.error('Image validation failed', String(error));
        return false;
      }
    }
  }

  /**
   * Publikus wrapper: kép validálása (preprocess + basic check)
   */
  async validateImageFileWithProcessing(imagePath: string): Promise<boolean> {
    try {
      await this.imageProcessingService.preprocessImage(imagePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Publikus wrapper: OCR szöveg kinyerése preprocess után
   */
  async extractTextForOcrValidation(imagePath: string): Promise<string> {
    const processedImage = await this.imageProcessingService.preprocessImage(imagePath);
    return this.imageProcessingService.extractTextFromImage(processedImage);
  }

  /**
   * Debug információk lekérése az elemzésről
   */
  async getAnalysisDebugInfo(imagePath: string): Promise<any> {
    try {
      const extractedText = await this.ocrService.extractTextFromImage(imagePath);
      const parsedData = this.tipDataParserService.parseTipData(extractedText);

      return {
        imagePath,
        imageExists: fs.existsSync(path.resolve(imagePath)),
        extractedTextLength: extractedText.length,
        extractedTextPreview: extractedText.substring(0, 500),
        parsedDataSummary: {
          extractedEntities: parsedData.extractedEntities,
          confidence: parsedData.confidence_score,
          hasMatchName: !!parsedData.matchName,
          hasOdds: !!parsedData.odds,
          hasOutcome: !!parsedData.outcome,
        },
        fullParsedData: parsedData,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        imagePath,
        imageExists: fs.existsSync(path.resolve(imagePath)),
      };
    }
  }

  /**
   * Képről meccsadatok kinyerése (OCR+parser)
   */
  async extractMatchDataFromImage(imageUrl: string): Promise<MatchData> {
    try {
      const text = await this.ocrService.extractTextFromImage(imageUrl);
      const parsed = this.tipDataParserService.parseTipData(text);
      if (!parsed.matchName || !parsed.matchDate) {
        throw new Error('Nem sikerült meccs adatokat kinyerni a képből.');
      }
      return {
        matchName: parsed.matchName,
        matchDate: parsed.matchDate,
        matchTime: parsed.matchTime,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Képelemzés sikertelen: ${err.message}`);
    }
  }

  /**
   * Képről fogadószelvény szövegének felismerése és fő adatok kinyerése
   */
  async recognizeTextFromBettingSlip(imageUrl: string): Promise<BettingSlipData> {
    try {
      const text = await this.ocrService.extractTextFromImage(imageUrl);
      const parsed = this.tipDataParserService.parseTipData(text);
      return {
        extractedText: text,
        odds: parsed.odds,
        stake: parsed.stake,
        outcome: parsed.outcome,
        tipCategory: parsed.tipCategory,
        confidence: parsed.confidence,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Fogadószelvény elemzés sikertelen: ${err.message}`);
    }
  }

  /**
   * Képről automatikus tipp kitöltés (CreateTipDto generálás)
   */
  async autoFillTipFromImage(imageUrl: string): Promise<CreateTipDto> {
    try {
      const text = await this.ocrService.extractTextFromImage(imageUrl);
      const parsed = this.tipDataParserService.parseTipData(text);
      if (!parsed.matchName || !parsed.matchDate || !parsed.outcome || !parsed.tipCategory) {
        throw new Error('Nem sikerült minden szükséges tipp adatot kinyerni a képből.');
      }
      return {
        title: `${parsed.matchName} - Tipp`,
        content: parsed.rawText,
        tipCategory: parsed.tipCategory,
        matchName: parsed.matchName,
        matchDate: parsed.matchDate,
        matchTime: parsed.matchTime,
        outcome: parsed.outcome,
        odds: parsed.odds,
        stake: parsed.stake,
        confidence: parsed.confidence,
      } as CreateTipDto;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Tipp automatikus kitöltése sikertelen: ${err.message}`);
    }
  }
}
