import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AnalyticsModule } from './analytics-dashboard/analytics.module';

@Module({
  imports: [UsersModule, CommentsModule, AnalyticsModule],
  controllers: [AdminController],
})
export class AdminModule {}
