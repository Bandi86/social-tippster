import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../posts/entities/posts.entity';
import { UploadsModule } from '../uploads/uploads.module';
import { ImageAnalysisController } from './image-analysis.controller';
import { ImageAnalysisService } from './image-analysis.service';
import { ImageProcessingService } from './image-processing.service';
import { OcrService } from './ocr.service';
import { TipDataParserService } from './tip-data-parser.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UploadsModule],
  controllers: [ImageAnalysisController],
  providers: [ImageAnalysisService, OcrService, TipDataParserService, ImageProcessingService],
  exports: [ImageAnalysisService, OcrService, TipDataParserService],
})
export class ImageAnalysisModule {}
