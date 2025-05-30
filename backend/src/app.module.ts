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
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule } from './modules/users/users.module';

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
    AdminModule,
    AnalyticsModule,
    MatchModule,
    LeagueModule,
    TeamModule,
    PlayerModule,
    SeasonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfProtectionMiddleware).forRoutes('auth/refresh');
  }
}
