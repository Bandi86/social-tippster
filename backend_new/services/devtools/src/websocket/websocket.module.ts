import { Module } from '@nestjs/common';
import { DockerModule } from '../docker/docker.module';
import { HealthModule } from '../health/health.module';
import { ProjectModule } from '../project/project.module';
import { WebSocketController } from './websocket.controller';
import { DevToolsWebSocketGateway } from './websocket.gateway';

@Module({
  imports: [ProjectModule, HealthModule, DockerModule],
  controllers: [WebSocketController],
  providers: [DevToolsWebSocketGateway],
  exports: [DevToolsWebSocketGateway],
})
export class WebSocketModule {}
