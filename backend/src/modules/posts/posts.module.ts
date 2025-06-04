import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageProcessingService } from '../image-analysis/image-processing.service';
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
  controllers: [PostsController],
  providers: [PostsService, ImageProcessingService],
  exports: [PostsService, TypeOrmModule],
})
export class PostsModule {}
