import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageAnalysisModule } from '../image-analysis/image-analysis.module';
import { Post } from '../posts/entities/posts.entity';
import { PostsModule } from '../posts/posts.module';
import { User } from '../users/entities/user.entity';
import { Tip } from './entities/tip.entity';
import { TipValidationService } from './tip-validation.service';
import { TippsController } from './tipps.controller';
import { TippsService } from './tipps.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Tip]), ImageAnalysisModule, PostsModule],
  controllers: [TippsController],
  providers: [TippsService, TipValidationService],
  exports: [TippsService, TipValidationService, TypeOrmModule],
})
export class TippsModule {}
