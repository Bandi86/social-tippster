import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as tesseract from 'tesseract.js';

export interface BettingSlipData {
  matchDate?: Date;
  team1?: string;
  team2?: string;
  outcome?: string;
  odds?: number;
  stake?: number;
  combinations?: string;
  totalBet?: number;
  resultOdds?: number;
  maxWinning?: number;
  ticketNumber?: string;
  submissionTime?: Date;
  validityTime?: Date;
  gamePrice?: number;
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Process uploaded image and enhance it for OCR
   */
  async preprocessImage(imagePath: string): Promise<Buffer> {
    try {
      // Enhance image for better OCR results
      const processedImage = await sharp(imagePath)
        .greyscale()
        .normalise()
        .sharpen()
        .png()
        .toBuffer();

      this.logger.log('Image preprocessed successfully');
      return processedImage;
    } catch (error) {
      this.logger.error('Error preprocessing image:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  /**
   * Extract text from image using OCR
   */
  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const {
        data: { text },
      } = await tesseract.recognize(
        imageBuffer,
        'hun+eng', // Hungarian and English language support
        {
          logger: m => this.logger.debug(`OCR Progress: ${m.status} - ${m.progress}`),
        },
      );

      this.logger.log('Text extracted from image successfully');
      return text;
    } catch (error) {
      this.logger.error('Error extracting text from image:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Parse betting slip data from extracted text
   */
  parseBettingSlipData(extractedText: string): BettingSlipData {
    this.logger.log('Parsing betting slip data from extracted text');

    const data: BettingSlipData = {};

    try {
      // Parse match date (various formats)
      const dateRegex =
        /(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}:\d{2})|(\d{2}[-/]\d{2}[-/]\d{4}\s+\d{2}:\d{2})/g;
      const dateMatch = extractedText.match(dateRegex);
      if (dateMatch) {
        data.matchDate = new Date(dateMatch[0]);
      }

      // Parse team names (look for common patterns)
      const teamRegex =
        /([A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű\s]+)\s+(vs|gegen|-)\s+([A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű\s]+)/i;
      const teamMatch = extractedText.match(teamRegex);
      if (teamMatch) {
        data.team1 = teamMatch[1].trim();
        data.team2 = teamMatch[3].trim();
      }

      // Parse odds (decimal format)
      const oddsRegex = /odds?\s*:?\s*(\d+\.?\d*)/i;
      const oddsMatch = extractedText.match(oddsRegex);
      if (oddsMatch) {
        data.odds = parseFloat(oddsMatch[1]);
      }

      // Parse stake/bet amount
      const stakeRegex = /(tét|stake|bet)\s*:?\s*(\d+(?:\.\d{2})?)/i;
      const stakeMatch = extractedText.match(stakeRegex);
      if (stakeMatch) {
        data.stake = parseFloat(stakeMatch[2]);
      }

      // Parse total bet
      const totalBetRegex = /(összes\s+tét|total\s+bet)\s*:?\s*(\d+(?:\.\d{2})?)/i;
      const totalBetMatch = extractedText.match(totalBetRegex);
      if (totalBetMatch) {
        data.totalBet = parseFloat(totalBetMatch[2]);
      }

      // Parse result odds
      const resultOddsRegex = /(eredő\s+odds|result\s+odds)\s*:?\s*(\d+\.?\d*)/i;
      const resultOddsMatch = extractedText.match(resultOddsRegex);
      if (resultOddsMatch) {
        data.resultOdds = parseFloat(resultOddsMatch[2]);
      }

      // Parse maximum winning
      const maxWinningRegex = /(maximum\s+nyeremény|max\s+winning)\s*:?\s*(\d+(?:\.\d{2})?)/i;
      const maxWinningMatch = extractedText.match(maxWinningRegex);
      if (maxWinningMatch) {
        data.maxWinning = parseFloat(maxWinningMatch[2]);
      }

      // Parse ticket number
      const ticketRegex = /(szelvény\s+száma|ticket\s+number)\s*:?\s*([A-Z0-9]+)/i;
      const ticketMatch = extractedText.match(ticketRegex);
      if (ticketMatch) {
        data.ticketNumber = ticketMatch[2];
      }

      // Parse submission time
      const submissionRegex =
        /(játékba\s+küldés|submission)\s+ideje?\s*:?\s*(\d{4}[-\/]\d{2}[-\/]\d{2}\s+\d{2}:\d{2})/i;
      const submissionMatch = extractedText.match(submissionRegex);
      if (submissionMatch) {
        data.submissionTime = new Date(submissionMatch[2]);
      }

      // Parse validity time
      const validityRegex =
        /(játék\s+érvényessége|validity)\s*:?\s*(\d{4}[-\/]\d{2}[-\/]\d{2}\s+\d{2}:\d{2})/i;
      const validityMatch = extractedText.match(validityRegex);
      if (validityMatch) {
        data.validityTime = new Date(validityMatch[2]);
      }

      // Parse combinations
      const comboRegex = /(kombináció|combination)\s*:?\s*([0-9\/]+)/i;
      const comboMatch = extractedText.match(comboRegex);
      if (comboMatch) {
        data.combinations = comboMatch[2];
      }

      // Parse outcome (win/draw/lose)
      const outcomeRegex = /(győzelem|döntetlen|vereség|win|draw|loss|1|X|2)/i;
      const outcomeMatch = extractedText.match(outcomeRegex);
      if (outcomeMatch) {
        const outcome = outcomeMatch[1].toLowerCase();
        if (outcome.includes('győz') || outcome.includes('win') || outcome === '1') {
          data.outcome = 'win';
        } else if (outcome.includes('dönt') || outcome.includes('draw') || outcome === 'x') {
          data.outcome = 'draw';
        } else if (outcome.includes('ver') || outcome.includes('loss') || outcome === '2') {
          data.outcome = 'loss';
        }
      }

      this.logger.log('Betting slip data parsed successfully:', data);
      return data;
    } catch (error) {
      this.logger.error('Error parsing betting slip data:', error);
      return data; // Return partial data even if parsing fails
    }
  }

  /**
   * Validate extracted betting slip data
   */
  validateBettingSlipData(data: BettingSlipData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!data.odds || data.odds < 1.01 || data.odds > 100) {
      errors.push('Invalid or missing odds');
    }

    if (!data.stake || data.stake <= 0) {
      errors.push('Invalid or missing stake amount');
    }

    if (data.matchDate && data.matchDate < new Date()) {
      errors.push('Match date is in the past');
    }

    if (data.submissionTime && data.validityTime && data.submissionTime >= data.validityTime) {
      errors.push('Submission time must be before validity time');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Complete image processing pipeline
   */
  async processBettingSlipImage(imagePath: string): Promise<{
    success: boolean;
    data?: BettingSlipData;
    errors?: string[];
    extractedText?: string;
  }> {
    try {
      // Step 1: Preprocess image
      const processedImage = await this.preprocessImage(imagePath);

      // Step 2: Extract text using OCR
      const extractedText = await this.extractTextFromImage(processedImage);

      // Step 3: Parse betting slip data
      const bettingData = this.parseBettingSlipData(extractedText);

      // Step 4: Validate data
      const validation = this.validateBettingSlipData(bettingData);

      if (validation.isValid) {
        return {
          success: true,
          data: bettingData,
          extractedText,
        };
      } else {
        return {
          success: false,
          data: bettingData,
          errors: validation.errors,
          extractedText,
        };
      }
    } catch (error) {
      this.logger.error('Error processing betting slip image:', error);
      return {
        success: false,
        errors: [error.message || 'Unknown error occurred'],
      };
    }
  }
}
