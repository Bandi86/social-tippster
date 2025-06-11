import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RedisConfig } from '../config/redis.config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RedisSessionService } from './session/redis-session.service';
import { SessionService } from './session/session.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FreshUserDataService } from './user/fresh-user-data.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.ACCESS_TOKEN_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    RedisSessionService,
    FreshUserDataService,
    RedisConfig,
    JwtStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [
    AuthService,
    SessionService,
    RedisSessionService,
    FreshUserDataService,
    JwtStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
})
export class AuthModule {}
