import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { ImageProcessingService } from './image-processing.service';
import { UploadsService } from './uploads.service';

// Utility to ensure directory exists
function ensureDirSync(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Type guard for Express.Multer.File
function isValidUploadedFile(
  file: unknown,
): file is { filename: string; originalname: string; path: string; mimetype: string } {
  return (
    typeof file === 'object' &&
    file !== null &&
    typeof (file as { filename?: unknown })?.filename === 'string' &&
    typeof (file as { originalname?: unknown })?.originalname === 'string' &&
    typeof (file as { path?: unknown })?.path === 'string'
  );
}

@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly imageProcessingService: ImageProcessingService) {}

  @Post('profile')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: '../../uploads/profile',
      fileFilter: (req, file, cb) => {
        if (!file.mimetype || typeof file.mimetype !== 'string') {
          return cb(new BadRequestException('Invalid file format'), false);
        }

        if (!/\/(jpg|jpeg|png)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadProfile(@UploadedFile() file: unknown): { url: string; error?: string } {
    ensureDirSync(path.resolve('../../uploads/profile'));

    if (!isValidUploadedFile(file)) {
      return { url: '', error: 'Invalid file upload' };
    }

    // Generate a new filename to avoid conflicts
    const newFilename = UploadsService.generateFilename(file.originalname || 'upload.jpg');
    const oldPath = file.path;
    const newPath = path.join(path.dirname(oldPath), newFilename);

    // Rename the file to have a proper unique name
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }

    return { url: `/uploads/profile/${newFilename}` };
  }

  @Post('post')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: '../../uploads/posts',
      fileFilter: (req, file, cb) => {
        if (!file.mimetype || typeof file.mimetype !== 'string') {
          return cb(new BadRequestException('Invalid file format'), false);
        }

        if (!/\/(jpg|jpeg|png)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadPost(
    @UploadedFile() file: unknown,
    @Body() body: { processBettingSlip?: string },
  ): Promise<{
    url: string;
    error?: string;
    bettingSlipData?: any;
    ocrText?: string;
  }> {
    ensureDirSync(path.resolve('../../uploads/posts'));

    if (!isValidUploadedFile(file)) {
      return { url: '', error: 'Invalid file upload' };
    }

    // Generate a new filename to avoid conflicts
    const newFilename = UploadsService.generateFilename(file.originalname || 'upload.jpg');
    const oldPath = file.path;
    const newPath = path.join(path.dirname(oldPath), newFilename);

    // Rename the file to have a proper unique name
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }

    const result: {
      url: string;
      error?: string;
      bettingSlipData?: any;
      ocrText?: string;
    } = { url: `/uploads/posts/${newFilename}` };

    // Process betting slip if requested
    if (body.processBettingSlip === 'true') {
      try {
        this.logger.log('Processing betting slip image...');
        const bettingSlipResult =
          await this.imageProcessingService.processBettingSlipImage(newPath);

        if (bettingSlipResult.success) {
          result.bettingSlipData = bettingSlipResult.data;
          result.ocrText = bettingSlipResult.extractedText;
          this.logger.log('Betting slip processed successfully');
        } else {
          result.error = `Betting slip processing failed: ${bettingSlipResult.errors?.join(', ')}`;
          result.ocrText = bettingSlipResult.extractedText;
          this.logger.warn('Betting slip processing failed', bettingSlipResult.errors);
        }
      } catch (error) {
        this.logger.error('Error processing betting slip:', error);
        result.error = 'Failed to process betting slip';
      }
    }

    return result;
  }

  @Post('betting-slip')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: '../../uploads/betting-slips',
      fileFilter: (req, file, cb) => {
        if (!file.mimetype || typeof file.mimetype !== 'string') {
          return cb(new BadRequestException('Invalid file format'), false);
        }

        if (!/\/(jpg|jpeg|png)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // Larger limit for betting slips
    }),
  )
  async uploadBettingSlip(@UploadedFile() file: unknown): Promise<{
    url: string;
    success: boolean;
    data?: any;
    errors?: string[];
    extractedText?: string;
  }> {
    ensureDirSync(path.resolve('../../uploads/betting-slips'));

    if (!isValidUploadedFile(file)) {
      return {
        url: '',
        success: false,
        errors: ['Invalid file upload'],
      };
    }

    // Generate a new filename to avoid conflicts
    const newFilename = UploadsService.generateFilename(file.originalname || 'betting-slip.jpg');
    const oldPath = file.path;
    const newPath = path.join(path.dirname(oldPath), newFilename);

    // Rename the file to have a proper unique name
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }

    try {
      this.logger.log('Processing betting slip image...');
      const result = await this.imageProcessingService.processBettingSlipImage(newPath);

      return {
        url: `/uploads/betting-slips/${newFilename}`,
        success: result.success,
        data: result.data,
        errors: result.errors,
        extractedText: result.extractedText,
      };
    } catch (error) {
      this.logger.error('Error processing betting slip:', error);
      return {
        url: `/uploads/betting-slips/${newFilename}`,
        success: false,
        errors: ['Failed to process betting slip image'],
      };
    }
  }
}
