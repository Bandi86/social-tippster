import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { ServiceHealth } from '../common/interfaces';
import { ProcessUtils } from '../common/utils';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private healthCache: Map<string, ServiceHealth> = new Map();

  private readonly services = [
    { name: 'api-gateway', port: 3000, path: '/health' },
    { name: 'auth', port: 3001, path: '/api/health' },
    { name: 'frontend-new', port: 3002, path: '/' },
    { name: 'user', port: 3003, path: '/api/health' },
    { name: 'post', port: 3004, path: '/api/health' },
    { name: 'stats', port: 3005, path: '/api/health' },
    { name: 'tipp', port: 3006, path: '/api/health' },
    { name: 'notifications', port: 3007, path: '/api/health' },
    { name: 'chat', port: 3008, path: '/api/health' },
    { name: 'data', port: 3009, path: '/api/health' },
    { name: 'image', port: 3010, path: '/api/health' },
    { name: 'live', port: 3011, path: '/api/health' },
    { name: 'log', port: 3012, path: '/api/health' },
    { name: 'admin', port: 3013, path: '/api/health' },
    { name: 'devtools', port: 3014, path: '/api/health' },
  ];

  constructor(private configService: ConfigService) {}

  async checkAllServices(): Promise<{
    overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    services: ServiceHealth[];
    summary: {
      total: number;
      healthy: number;
      unhealthy: number;
      degraded: number;
      unknown: number;
    };
    timestamp: string;
  }> {
    const healthChecks = await Promise.all(
      this.services.map(service => this.checkService(service)),
    );

    const services = healthChecks.filter(Boolean) as ServiceHealth[];

    // Update cache
    this.healthCache.clear();
    services.forEach(service => {
      this.healthCache.set(service.serviceName, service);
    });

    const summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      unhealthy: services.filter(s => s.status === 'unhealthy').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      unknown: services.filter(s => s.status === 'unknown').length,
    };

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (summary.unhealthy > summary.total * 0.5) {
      overallStatus = 'unhealthy';
    } else if (summary.unhealthy > 0 || summary.degraded > 0) {
      overallStatus = 'degraded';
    }

    return {
      overallStatus,
      services,
      summary,
      timestamp: new Date().toISOString(),
    };
  }

  async checkService(service: {
    name: string;
    port: number;
    path: string;
  }): Promise<ServiceHealth | null> {
    const startTime = Date.now();
    const baseUrl = `http://localhost:${service.port}`;

    try {
      // First check if port is in use
      const portInUse = await ProcessUtils.checkPortInUse(service.port);
      if (!portInUse) {
        return {
          serviceName: service.name,
          status: 'unhealthy',
          responseTime: -1,
          version: 'unknown',
          timestamp: new Date().toISOString(),
          error: 'Service not running - port not in use',
          details: {
            port: service.port,
            url: `${baseUrl}${service.path}`,
          },
        };
      }

      // Try to make HTTP request
      const response = await axios.get(`${baseUrl}${service.path}`, {
        timeout: 5000,
        validateStatus: status => status < 500, // Accept 4xx but not 5xx
      });

      const responseTime = Date.now() - startTime;
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      let version = 'unknown';

      // Determine status based on response
      if (response.status >= 400) {
        status = 'degraded';
      } else if (responseTime > 2000) {
        status = 'degraded';
      }

      // Try to extract version from response
      if (response.data && typeof response.data === 'object') {
        version = response.data.version || response.data.app?.version || 'unknown';
      }

      return {
        serviceName: service.name,
        status,
        responseTime,
        version,
        timestamp: new Date().toISOString(),
        details: {
          port: service.port,
          url: `${baseUrl}${service.path}`,
          statusCode: response.status,
          responseSize: JSON.stringify(response.data || {}).length,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        serviceName: service.name,
        status: 'unhealthy',
        responseTime,
        version: 'unknown',
        timestamp: new Date().toISOString(),
        error: error.message,
        details: {
          port: service.port,
          url: `${baseUrl}${service.path}`,
          errorType: error.code || 'UNKNOWN',
        },
      };
    }
  }

  async getServiceHealth(serviceName: string): Promise<ServiceHealth | null> {
    const service = this.services.find(s => s.name === serviceName);
    if (!service) {
      return null;
    }

    return this.checkService(service);
  }

  async getCachedHealth(): Promise<ServiceHealth[]> {
    return Array.from(this.healthCache.values());
  }

  async getSystemHealth() {
    try {
      const [cpuUsage, memoryUsage, diskUsage] = await Promise.all([
        this.getCpuUsage(),
        this.getMemoryUsage(),
        this.getDiskUsage(),
      ]);

      return {
        cpu: cpuUsage,
        memory: memoryUsage,
        disk: diskUsage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get system health: ${error.message}`);
      throw error;
    }
  }

  async getDockerHealth() {
    try {
      // Check if Docker is running
      const { execSync } = require('child_process');

      try {
        execSync('docker info', { timeout: 5000 });
        return {
          status: 'healthy',
          message: 'Docker is running',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          message: 'Docker is not running or not accessible',
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.logger.error(`Failed to check Docker health: ${error.message}`);
      return {
        status: 'unknown',
        message: 'Failed to check Docker status',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async scheduledHealthCheck() {
    try {
      await this.checkAllServices();
      this.logger.debug('Scheduled health check completed');
    } catch (error) {
      this.logger.error(`Scheduled health check failed: ${error.message}`);
    }
  }

  private async getCpuUsage(): Promise<number> {
    try {
      const os = require('os');
      const cpus = os.cpus();

      return new Promise(resolve => {
        const startMeasure = cpus.map(cpu => ({
          idle: cpu.times.idle,
          total: Object.values(cpu.times).reduce((acc: number, time) => acc + (time as number), 0),
        }));

        setTimeout(() => {
          const endMeasure = os.cpus().map((cpu, i) => ({
            idle: cpu.times.idle,
            total: Object.values(cpu.times).reduce(
              (acc: number, time) => acc + (time as number),
              0,
            ),
          }));

          const idleDiff = endMeasure.reduce(
            (acc, end, i) => acc + (end.idle - startMeasure[i].idle),
            0,
          );
          const totalDiff = endMeasure.reduce(
            (acc, end, i) => acc + (end.total - startMeasure[i].total),
            0,
          );

          const cpuUsage = 100 - (100 * idleDiff) / totalDiff;
          resolve(Math.round(cpuUsage * 100) / 100);
        }, 100);
      });
    } catch (error) {
      return -1;
    }
  }

  private async getMemoryUsage() {
    try {
      const os = require('os');
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      return {
        total: Math.round(totalMemory / 1024 / 1024), // MB
        used: Math.round(usedMemory / 1024 / 1024), // MB
        free: Math.round(freeMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100),
      };
    } catch (error) {
      return {
        total: -1,
        used: -1,
        free: -1,
        percentage: -1,
      };
    }
  }

  private async getDiskUsage() {
    try {
      const { execSync } = require('child_process');
      const output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf-8' });

      const lines = output.split('\n').filter(line => line.trim() && !line.includes('Caption'));
      const disks = lines
        .map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const caption = parts[0];
            const freeSpace = parseInt(parts[1]) || 0;
            const size = parseInt(parts[2]) || 1;

            return {
              drive: caption,
              total: Math.round(size / 1024 / 1024 / 1024), // GB
              free: Math.round(freeSpace / 1024 / 1024 / 1024), // GB
              used: Math.round((size - freeSpace) / 1024 / 1024 / 1024), // GB
              percentage: Math.round(((size - freeSpace) / size) * 100),
            };
          }
          return null;
        })
        .filter(Boolean);

      return disks;
    } catch (error) {
      return [];
    }
  }
}
