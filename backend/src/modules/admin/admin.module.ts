import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [UsersModule, CommentsModule],
  controllers: [AdminController],
})
export class AdminModule {}
