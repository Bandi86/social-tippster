import { Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { SessionService } from '../session/session.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly sessionService: SessionService,
  ) {}

  async checkHealth() {
    const redisHealth = await this.sessionService.healthCheck();
    const sessionStats = await this.sessionService.getSessionStats();

    return {
      status: redisHealth ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
      redis: {
        status: redisHealth ? 'connected' : 'disconnected',
      },
      sessions: {
        total: sessionStats.totalSessions,
        activeUsers: sessionStats.activeUsers.size,
      },
    };
  }

  async checkAllServicesHealth() {
    const services = [
      'auth',
      'user',
      'post',
      'tipp',
      'comment',
      'notification',
      'upload',
      'image-analysis',
    ];
    const healthChecks = await Promise.allSettled(
      services.map(async service => {
        try {
          const response = await this.proxyService.forwardRequest(service, '/health', 'GET');
          return {
            service,
            status: response.status === 200 ? 'healthy' : 'unhealthy',
            responseTime: response.data?.timestamp || new Date().toISOString(),
          };
        } catch (error) {
          return {
            service,
            status: 'unhealthy',
            error: error.message,
          };
        }
      }),
    );

    return {
      gateway: this.checkHealth(),
      services: healthChecks.map((result, index) => ({
        service: services[index],
        ...(result.status === 'fulfilled'
          ? result.value
          : { status: 'error', error: result.reason }),
      })),
    };
  }
}
