import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageProcessingService } from '../uploads/image-processing.service';
import { User } from '../users/entities/user.entity';
import {
  Post,
  PostBookmark,
  PostComment,
  PostCommentVote,
  PostReport,
  PostShare,
  PostView,
  PostVote,
} from './entities';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TipValidationService } from './tip-validation.service';
import { TipsController } from './tips.controller';
import { TipsService } from './tips.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostVote,
      PostBookmark,
      PostShare,
      PostView,
      PostComment,
      PostCommentVote,
      PostReport,
      User,
    ]),
  ],
  controllers: [PostsController, TipsController],
  providers: [PostsService, TipsService, TipValidationService, ImageProcessingService],
  exports: [PostsService, TipsService, TipValidationService, TypeOrmModule],
})
export class PostsModule {}
