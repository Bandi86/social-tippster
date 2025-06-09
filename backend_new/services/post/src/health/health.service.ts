/* import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';


@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async check() {
    const startTime = Date.now();

    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');

      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        service: 'post-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: 'connected',
          responseTime: `${responseTime}ms`,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'post-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: 'disconnected',
          error: error.message,
        },
      };
    }
  }

  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ready',
        service: 'post-service',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not ready',
        service: 'post-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
 */
