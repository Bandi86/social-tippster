import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsModule } from '../admin/analytics-dashboard/analytics.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Import all strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

import { UserLogin } from '../admin/analytics-dashboard/entities/user-login.entity';
import { UserSession } from '../admin/analytics-dashboard/entities/user-session.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { DeviceFingerprintingService } from './services/device-fingerprinting.service';
import { JwtValidationService } from './services/jwt-validation.service';
import { SessionExpiryService } from './services/session-expiry.service';
import { SessionLifecycleService } from './services/session-lifecycle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, UserSession, UserLogin]),
    UsersModule,
    AnalyticsModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtValidationService,
    SessionLifecycleService,
    DeviceFingerprintingService,
    SessionExpiryService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
  ],
  exports: [
    AuthService,
    JwtValidationService,
    SessionLifecycleService,
    DeviceFingerprintingService,
    SessionExpiryService,
  ],
})
export class AuthModule {}
