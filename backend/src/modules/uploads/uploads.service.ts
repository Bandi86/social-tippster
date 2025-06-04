import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  // Simple utility method to get upload path
  static getUploadPath(folder: string): string {
    return `../../uploads/${folder}`;
  }

  // Generate unique filename
  static generateFilename(originalname: string): string {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = originalname.substring(originalname.lastIndexOf('.'));
    return `${uniqueSuffix}${extension}`;
  }
}
