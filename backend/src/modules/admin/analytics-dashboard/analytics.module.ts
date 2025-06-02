import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringService } from '../../../common/services/monitoring.service';
import { Comment } from '../../comments/entities/comment.entity';
import { Post } from '../../posts/entities';
import { User } from '../../users/entities/user.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DailyStats, MonthlyStats, SystemMetrics, UserLogin } from './entities';
import { UserSession } from './entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Comment,
      UserLogin,
      UserSession,
      DailyStats,
      MonthlyStats,
      SystemMetrics,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, MonitoringService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
