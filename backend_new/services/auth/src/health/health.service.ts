import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
      database: 'connected', // TODO: Add actual database health check
    };
  }
}
