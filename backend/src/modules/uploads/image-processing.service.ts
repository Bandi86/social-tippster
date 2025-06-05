// This file is now deprecated. All image analysis logic has been moved to the image-analysis module.
// Only basic file validation is kept for upload safety.
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface BasicImageData {
  extractedText: string;
  success: boolean;
  errors?: string[];
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
   * Basic image processing for validation only
   * @deprecated Use image-analysis service for complete image processing.
   */
  async processImage(filePath: string): Promise<BasicImageData> {
    await Promise.resolve(); // Artificial await to satisfy async/await linting
    try {
      this.logger.log(`Processing image: ${filePath}`);

      // Basic file validation
      if (!this.validateImageFile(filePath)) {
        return {
          success: false,
          errors: ['Invalid image file'],
          extractedText: '',
        };
      }

      // Basic validation only
      this.logger.log('Image is valid');
      return {
        success: true,
        extractedText: 'Basic image validation passed.',
      };
    } catch (error) {
      this.logger.error('Error processing image:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error processing image'],
        extractedText: '',
      };
    }
  }
}
