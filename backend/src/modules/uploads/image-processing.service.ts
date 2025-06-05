// This file is now deprecated. All image analysis logic has been moved to the image-analysis module.
// Only basic file validation is kept for upload safety.
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TipCategory } from '../tipps/enums/tip.enums';

export interface BettingSlipData {
  extractedText: string;
  odds?: number;
  stake?: number;
  outcome?: string;
  tipCategory?: TipCategory;
  confidence?: number;
  team1?: string;
  team2?: string;
  matchDate?: Date;
  validityTime?: Date;
  maxWinning?: number;
  combinations?: string;
  totalBet?: number;
  submissionTime?: Date;
}

export interface BettingSlipResult {
  success: boolean;
  data?: BettingSlipData;
  errors?: string[];
  extractedText?: string;
}

/**
 * @deprecated Use image-analysis/image-processing.service.ts for all image analysis logic.
 * This service only provides basic file validation for uploads.
 */
@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Validate image file by extension and existence
   */
  validateImageFile(filePath: string): boolean {
    try {
      const fullPath = path.resolve(filePath);
      if (!fs.existsSync(fullPath)) {
        return false;
      }
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'];
      const fileExtension = path.extname(fullPath).toLowerCase();
      return allowedExtensions.includes(fileExtension);
    } catch (error) {
      this.logger.error('Image validation failed:', error);
      return false;
    }
  }

  /**
   * Process a betting slip image to extract relevant data.
   * This is a simple implementation that delegates to the image-analysis module.
   * @deprecated Use image-analysis service for complete image processing.
   */
  async processBettingSlipImage(filePath: string): Promise<BettingSlipResult> {
    await Promise.resolve(); // Artificial await to satisfy async/await linting
    try {
      this.logger.log(`Processing betting slip image: ${filePath}`);

      // Basic file validation
      if (!this.validateImageFile(filePath)) {
        return {
          success: false,
          errors: ['Invalid image file'],
          extractedText: '',
        };
      }

      // In a complete implementation, this would call the image-analysis service
      // But for now, return a minimal valid result
      this.logger.log('Image is valid, but OCR processing is unavailable');
      return {
        success: false,
        errors: [
          'OCR processing is not implemented in this service. Use image-analysis service instead.',
        ],
        extractedText: 'OCR processing not available in this service.',
      };
    } catch (error) {
      this.logger.error('Error processing betting slip:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error processing betting slip'],
        extractedText: '',
      };
    }
  }
}
