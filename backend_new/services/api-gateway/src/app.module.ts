import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { SessionMiddleware } from './middleware/session.middleware';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '.env.docker'],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('RATE_LIMIT_TTL', 60) * 1000, // Convert to milliseconds
          limit: configService.get('RATE_LIMIT_REQUESTS', 100),
        },
      ],
      inject: [ConfigService],
    }),
    // TODO: Add Redis cache when dependencies are resolved
    // CacheModule.registerAsync({...}),
    // TODO: Add RabbitMQ when @nestjs/microservices is installed
    // ClientsModule.registerAsync([...]),
    ProxyModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*'); // Apply to all routes
  }
}
