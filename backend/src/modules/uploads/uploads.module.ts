import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageProcessingService } from './image-processing.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, ImageProcessingService],
  exports: [UploadsService, ImageProcessingService],
})
export class UploadsModule {}
