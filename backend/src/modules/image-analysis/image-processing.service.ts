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

  async preprocessImage(imagePath: string): Promise<Buffer> {
    try {
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

  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const result = await tesseract.recognize(imageBuffer, 'hun+eng', {
        logger: m => this.logger.debug(`OCR Progress: ${m.status} - ${m.progress}`),
      });
      const text = result.data.text;
      this.logger.log('Text extracted from image successfully');
      return text;
    } catch (error) {
      this.logger.error('Error extracting text from image:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  parseBettingSlipData(extractedText: string): BettingSlipData {
    // TODO: implement logic, parameter is intentionally unused for now
    void extractedText;
    const data: BettingSlipData = {};
    try {
      // TODO: Move all regex and parsing logic here from the old file
      this.logger.log('Betting slip data parsed successfully:', data);
      return data;
    } catch (error) {
      this.logger.error('Error parsing betting slip data:', error);
      return data;
    }
  }

  validateBettingSlipData(data: BettingSlipData): { isValid: boolean; errors: string[] } {
    // TODO: implement logic, parameter is intentionally unused for now
    void data;
    const errors: string[] = [];
    // TODO: Move validation logic here from the old file
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async processBettingSlipImage(imagePath: string): Promise<{
    success: boolean;
    data?: BettingSlipData;
    errors?: string[];
    extractedText?: string;
  }> {
    try {
      const processedImage = await this.preprocessImage(imagePath);
      const extractedText = await this.extractTextFromImage(processedImage);
      const bettingData = this.parseBettingSlipData(extractedText);
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
      let errorMsg = 'Unknown error occurred';
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        errorMsg = (error as { message: string }).message;
      }
      this.logger.error('Error processing betting slip image:', error);
      return {
        success: false,
        errors: [errorMsg],
      };
    }
  }
}
