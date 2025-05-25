import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment, CommentReport, CommentVote } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentVote, CommentReport])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
