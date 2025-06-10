import { Module } from '@nestjs/common';
import { DockerModule } from '../docker/docker.module';
import { HealthModule } from '../health/health.module';
import { ProjectModule } from '../project/project.module';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';

@Module({
  imports: [DockerModule, ProjectModule, HealthModule],
  controllers: [McpController],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
