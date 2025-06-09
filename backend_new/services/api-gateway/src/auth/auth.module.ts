import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
