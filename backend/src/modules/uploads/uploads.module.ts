import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageProcessingService } from './image-processing.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Changed from './uploads' to ensure it's at the root, though this might be relative to the backend module. It's better to rely on the controller's `dest`.
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, ImageProcessingService],
  exports: [UploadsService, ImageProcessingService],
})
export class UploadsModule {}
