import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponseDto, ServiceHealthDto } from '../common/dto/service-health.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get overall health status of all services' })
  @ApiResponse({
    status: 200,
    description: 'Health check completed successfully',
    type: HealthCheckResponseDto,
  })
  async getOverallHealth() {
    return this.healthService.checkAllServices();
  }

  @Get('services')
  @ApiOperation({ summary: 'Get health status of all services (from cache)' })
  @ApiResponse({
    status: 200,
    description: 'Cached service health retrieved successfully',
    type: [ServiceHealthDto],
  })
  async getCachedServiceHealth() {
    const services = await this.healthService.getCachedHealth();
    return {
      services,
      total: services.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('service/:name')
  @ApiOperation({ summary: 'Get health status of a specific service' })
  @ApiParam({ name: 'name', description: 'Service name to check' })
  @ApiResponse({
    status: 200,
    description: 'Service health retrieved successfully',
    type: ServiceHealthDto,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceHealth(@Param('name') serviceName: string) {
    const health = await this.healthService.getServiceHealth(serviceName);
    if (!health) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    return health;
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system health (CPU, Memory, Disk)' })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  async getSystemHealth() {
    return this.healthService.getSystemHealth();
  }

  @Get('docker')
  @ApiOperation({ summary: 'Get Docker health status' })
  @ApiResponse({ status: 200, description: 'Docker health status retrieved successfully' })
  async getDockerHealth() {
    return this.healthService.getDockerHealth();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get health summary with key metrics' })
  @ApiResponse({ status: 200, description: 'Health summary retrieved successfully' })
  async getHealthSummary() {
    const [servicesHealth, systemHealth, dockerHealth] = await Promise.all([
      this.healthService.checkAllServices(),
      this.healthService.getSystemHealth(),
      this.healthService.getDockerHealth(),
    ]);

    return {
      services: {
        total: servicesHealth.summary.total,
        healthy: servicesHealth.summary.healthy,
        unhealthy: servicesHealth.summary.unhealthy,
        overallStatus: servicesHealth.overallStatus,
      },
      system: {
        cpu: systemHealth.cpu,
        memory: systemHealth.memory.percentage,
        disk: systemHealth.disk[0]?.percentage || -1,
      },
      docker: {
        status: dockerHealth.status,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('critical')
  @ApiOperation({ summary: 'Get critical services that are down' })
  @ApiResponse({ status: 200, description: 'Critical services status retrieved successfully' })
  async getCriticalServices() {
    const health = await this.healthService.checkAllServices();
    const criticalServices = ['auth', 'api-gateway', 'frontend-new'];

    const criticalDown = health.services.filter(
      service => criticalServices.includes(service.serviceName) && service.status !== 'healthy',
    );

    return {
      criticalServices: criticalDown,
      totalCritical: criticalServices.length,
      criticalDown: criticalDown.length,
      allCriticalHealthy: criticalDown.length === 0,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics for all services' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getPerformanceMetrics() {
    const health = await this.healthService.checkAllServices();

    const performanceData = health.services.map(service => ({
      serviceName: service.serviceName,
      responseTime: service.responseTime,
      status: service.status,
    }));

    const avgResponseTime =
      performanceData.filter(p => p.responseTime > 0).reduce((sum, p) => sum + p.responseTime, 0) /
      performanceData.filter(p => p.responseTime > 0).length;

    const slowServices = performanceData
      .filter(p => p.responseTime > 1000)
      .sort((a, b) => b.responseTime - a.responseTime);

    return {
      averageResponseTime: Math.round(avgResponseTime || 0),
      slowServices,
      totalServices: performanceData.length,
      timestamp: new Date().toISOString(),
    };
  }
}
