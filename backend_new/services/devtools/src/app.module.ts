import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

import { DockerModule } from './docker/docker.module';
import { HealthModule } from './health/health.module';
import { McpModule } from './mcp/mcp.module';
import { ProjectModule } from './project/project.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    TerminusModule,
    DockerModule,
    ProjectModule,
    HealthModule,
    McpModule,
    WebSocketModule,
  ],
})
export class AppModule {}
