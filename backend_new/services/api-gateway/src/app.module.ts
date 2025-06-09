import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
//import { CacheModule } from '@nestjs/cache-manager';
import { registerAs } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '.env.docker'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // requests per ttl
      },
    ]),
  /*    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: (await import('cache-manager-ioredis')).default,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        ttl: configService.get('CACHE_TTL'), // optional
      }),
      inject: [ConfigService],
    }), */
    ProxyModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
