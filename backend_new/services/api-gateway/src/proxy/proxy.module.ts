import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService], // Export ProxyService so other modules can use it
})
export class ProxyModule {}
