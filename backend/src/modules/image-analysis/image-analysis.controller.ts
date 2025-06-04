import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImageAnalysisResult, ImageAnalysisService } from './image-analysis.service';

// Multer konfigurálása képfeltöltéshez
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'temp');

    // Mappa létrehozása ha nem létezik
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Egyedi fájlnév generálása
    const uniqueName = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Fájl szűrő - csak képek engedélyezettek
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/bmp',
    'image/tiff',
    'image/webp',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException('Csak képfájlok engedélyezettek (JPG, PNG, BMP, TIFF, WebP)'),
      false,
    );
  }
};

const multerOptions = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};

@ApiTags('Image Analysis')
@Controller('image-analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImageAnalysisController {
  private readonly logger = new Logger(ImageAnalysisController.name);

  constructor(private readonly imageAnalysisService: ImageAnalysisService) {}

  @Post('analyze-tip-image')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Tipp kép elemzése OCR-rel',
    description: 'Feltöltött kép elemzése és tipp adatok automatikus kinyerése',
  })
  @ApiResponse({
    status: 200,
    description: 'Sikeres képelemzés',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            extractedText: { type: 'string' },
            parsedData: { type: 'object' },
            validation: { type: 'object' },
            confidence: { type: 'number' },
            suggestedPostData: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Hibás kérés vagy képelemzési hiba',
  })
  async analyzeTipImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: ImageAnalysisResult }> {
    try {
      if (!file) {
        throw new BadRequestException('Nem található feltöltött kép');
      }
      this.logger.log(`Analyzing uploaded image: ${file.filename}`);
      // Kép elemzése
      const analysisResult = await this.imageAnalysisService.analyzeImageForTip(file.path);
      // Temp fájl törlése
      this.cleanupTempFile(file.path);
      return {
        success: true,
        data: analysisResult,
      };
    } catch (error: unknown) {
      if (file?.path) {
        this.cleanupTempFile(file.path);
      }
      if (error instanceof Error) {
        this.logger.error(`Image analysis failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Image analysis failed', String(error));
      }
      throw error;
    }
  }

  @Post('analyze-tip-image-url')
  @ApiOperation({
    summary: 'Tipp kép elemzése URL alapján',
    description: 'Már feltöltött kép elemzése az URL alapján',
  })
  @ApiResponse({
    status: 200,
    description: 'Sikeres képelemzés',
  })
  async analyzeTipImageFromUrl(
    @Query('imageUrl') imageUrl: string,
  ): Promise<{ success: boolean; data: ImageAnalysisResult }> {
    try {
      if (!imageUrl) {
        throw new BadRequestException('imageUrl paraméter kötelező');
      }

      // URL-ből teljes útvonal generálása
      const fullPath = path.join(process.cwd(), 'uploads', imageUrl.replace(/^\/+/, ''));

      // Fájl létezésének ellenőrzése
      if (!fs.existsSync(fullPath)) {
        throw new BadRequestException(`Kép nem található: ${imageUrl}`);
      }

      this.logger.log(`Analyzing image from URL: ${imageUrl}`);

      // Kép elemzése
      const analysisResult = await this.imageAnalysisService.analyzeImageForTip(fullPath);

      return {
        success: true,
        data: analysisResult,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Image analysis from URL failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Image analysis from URL failed', String(error));
      }
      throw error;
    }
  }

  @Get('debug-image-analysis')
  @ApiOperation({
    summary: 'Debug információk lekérése egy kép elemzéséről',
    description: 'Fejlesztői endpoint a képelemzés debugging-jához',
  })
  async getDebugInfo(
    @Query('imageUrl') imageUrl: string,
  ): Promise<{ success: boolean; data: Record<string, unknown> }> {
    try {
      if (!imageUrl) {
        throw new BadRequestException('imageUrl paraméter kötelező');
      }

      // URL-ből teljes útvonal generálása
      const fullPath = path.join(process.cwd(), 'uploads', imageUrl.replace(/^\/+/g, ''));

      this.logger.log(`Getting debug info for image: ${imageUrl}`);

      // Debug információk lekérése
      const debugInfo = (await this.imageAnalysisService.getAnalysisDebugInfo(fullPath)) as Record<
        string,
        unknown
      >;

      return {
        success: true,
        data: debugInfo,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Debug info retrieval failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Debug info retrieval failed', String(error));
      }
      throw error;
    }
  }

  @Post('validate-image')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Kép validálása OCR alkalmasság szempontjából',
    description: 'Ellenőrzi, hogy a feltöltött kép alkalmas-e OCR elemzésre',
  })
  async validateImageForOcr(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: { isValid: boolean; message: string } }> {
    try {
      if (!file) {
        throw new BadRequestException('Nem található feltöltött kép');
      }

      this.logger.log(`Validating uploaded image: ${file.filename}`);

      // Alap fájl validálás
      const isValidFile = this.imageAnalysisService.validateImageFile(file.path);

      if (!isValidFile) {
        this.cleanupTempFile(file.path);
        return {
          success: true,
          data: {
            isValid: false,
            message: 'A fájl nem megfelelő formátumú vagy sérült',
          },
        };
      }

      // Gyors OCR teszt - csak első 50 karakter
      try {
        const ocrText = await this.imageAnalysisService['ocrService'].extractTextFromImage(
          file.path,
        );
        const hasText = typeof ocrText === 'string' && ocrText.trim().length > 0;
        return {
          success: true,
          data: {
            isValid: Boolean(hasText),
            message: hasText ? 'A kép alkalmas OCR-re' : 'A kép nem alkalmas OCR-re',
          },
        };
      } catch {
        return {
          success: true,
          data: {
            isValid: false,
            message: 'OCR feldolgozás sikertelen',
          },
        };
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Image validation failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Image validation failed', String(error));
      }
      throw error;
    }
  }

  /**
   * Temp fájl tisztítása
   */
  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Temp file cleaned up: ${filePath}`);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to cleanup temp file: ${filePath}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
