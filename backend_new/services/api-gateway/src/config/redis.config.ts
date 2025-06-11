import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig implements OnModuleDestroy {
  private readonly logger = new Logger(RedisConfig.name);
  private redis: Redis;

  constructor() {
    this.redis = this.createConnection();
  }

  private createConnection(): Redis {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD;

    let redis: Redis;

    if (redisUrl) {
      this.logger.log(`Connecting to Redis via URL: ${redisUrl.replace(/:[^:]*@/, ':***@')}`);
      redis = new Redis(redisUrl, {
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      });
    } else {
      this.logger.log(`Connecting to Redis at ${redisHost}:${redisPort}`);
      redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      });
    }

    redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    redis.on('ready', () => {
      this.logger.log('Redis connection ready');
    });

    redis.on('error', error => {
      this.logger.error('Redis connection error:', error);
    });

    redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    return redis;
  }

  getClient(): Redis {
    return this.redis;
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
