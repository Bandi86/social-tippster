import { Module } from '@nestjs/common';
import { RouteController } from '../routes/route.controller';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  controllers: [ProxyController, RouteController],
  providers: [ProxyService],
  exports: [ProxyService], // Export ProxyService so other modules can use it
})
export class ProxyModule {}
