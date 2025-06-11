import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API Gateway health' })
  async checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('services')
  @ApiOperation({ summary: 'Check all microservices health' })
  async checkServicesHealth() {
    return this.healthService.checkAllServicesHealth();
  }
}
