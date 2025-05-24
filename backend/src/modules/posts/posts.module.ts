import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Post,
  PostBookmark,
  PostComment,
  PostCommentVote,
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
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService, TypeOrmModule],
})
export class PostsModule {}
