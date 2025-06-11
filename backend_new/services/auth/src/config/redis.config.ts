import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  private readonly logger = new Logger(RedisConfig.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.createConnection();
  }

  private createConnection(): void {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD', 'your_secure_password');

    try {
      if (redisUrl) {
        // Parse URL and add password if needed
        const urlWithPassword = redisUrl.includes('@')
          ? redisUrl
          : redisUrl.replace('redis://', `redis://:${redisPassword}@`);
        this.client = new Redis(urlWithPassword);
      } else {
        this.client = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
          lazyConnect: false,
        });
      }

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis successfully');
      });

      this.client.on('error', error => {
        this.logger.error('Redis connection error:', error);
      });

      this.client.on('ready', () => {
        this.logger.log('Redis client is ready');
      });
    } catch (error) {
      this.logger.error('Failed to create Redis connection:', error);
      throw error;
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
