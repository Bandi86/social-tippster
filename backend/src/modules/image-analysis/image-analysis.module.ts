import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../posts/entities/posts.entity';
import { ImageAnalysisController } from './image-analysis.controller';
import { ImageAnalysisService } from './image-analysis.service';
import { OcrService } from './ocr.service';
import { TipDataParserService } from './tip-data-parser.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [ImageAnalysisController],
  providers: [ImageAnalysisService, OcrService, TipDataParserService],
  exports: [ImageAnalysisService, OcrService, TipDataParserService],
})
export class ImageAnalysisModule {}
