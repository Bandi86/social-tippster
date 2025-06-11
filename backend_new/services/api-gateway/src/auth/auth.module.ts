import { Module } from '@nestjs/common';
import { RedisConfig } from '../config/redis.config';
import { ProxyModule } from '../proxy/proxy.module';
import { SessionService } from '../session/session.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [ProxyModule],
  providers: [AuthGuard, SessionService, RedisConfig],
  exports: [AuthGuard, SessionService, RedisConfig],
})
export class AuthModule {}
