import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProxyModule } from '../proxy/proxy.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [ProxyModule, AuthModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
