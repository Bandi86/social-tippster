import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { ThrottlerConfig } from './config/throttler.config';
import { DatabaseModule } from './database/db.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/admin/analytics-dashboard/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { CsrfProtectionMiddleware } from './modules/auth/middleware/csrf-protection.middleware';
import { CommentsModule } from './modules/comments/comments.module';
import { LeagueModule } from './modules/data/league/league.module';
import { MatchModule } from './modules/data/match/match.module';
import { PlayerModule } from './modules/data/player/player.module';
import { SeasonModule } from './modules/data/season/season.module';
import { TeamModule } from './modules/data/team/team.module';
import { ImageAnalysisModule } from './modules/image-analysis/image-analysis.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PostsModule } from './modules/posts/posts.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';

// Only apply ThrottlerGuard in production
const guards: Array<{ provide: typeof APP_GUARD; useClass: typeof ThrottlerGuard }> = [];
if (process.env.NODE_ENV !== 'development') {
  guards.push({
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  });
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerConfig,
    DatabaseModule,
    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    NotificationsModule,
    AdminModule,
    AnalyticsModule,
    MatchModule,
    LeagueModule,
    TeamModule,
    PlayerModule,
    SeasonModule,
    UploadsModule,
    ImageAnalysisModule,
  ],
  controllers: [
    AppController,
    // Add any additional controllers here
  ],
  providers: [AppService, ...guards],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfProtectionMiddleware).forRoutes('auth/refresh');
  }
}
