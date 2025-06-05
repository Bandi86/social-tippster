import {
  BadRequestException,
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
  uploadPost(@UploadedFile() file: unknown): { url: string; error?: string } {
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

    return { url: `/uploads/posts/${newFilename}` };
  }
}
