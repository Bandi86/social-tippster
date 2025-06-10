import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly serviceUrls: Record<string, string>;

  constructor(private configService: ConfigService) {
    this.serviceUrls = {
      auth: this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3001'),
      user: this.configService.get('USER_SERVICE_URL', 'http://localhost:3002'),
      post: this.configService.get('POST_SERVICE_URL', 'http://localhost:3003'),
      tipp: this.configService.get('TIPP_SERVICE_URL', 'http://localhost:3004'),
      comment: this.configService.get('COMMENT_SERVICE_URL', 'http://localhost:3005'),
      notification: this.configService.get('NOTIFICATION_SERVICE_URL', 'http://localhost:3006'),
      upload: this.configService.get('UPLOAD_SERVICE_URL', 'http://localhost:3007'),
      'image-analysis': this.configService.get(
        'IMAGE_ANALYSIS_SERVICE_URL',
        'http://localhost:3008',
      ),
    };
  }

  async forwardRequest(
    serviceName: string,
    path: string,
    method: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<AxiosResponse> {
    const serviceUrl = this.serviceUrls[serviceName];

    if (!serviceUrl) {
      this.logger.error(`Service ${serviceName} not found`);
      throw new Error(`Service ${serviceName} not found`);
    }

    const url = `${serviceUrl}${path}`;
    const correlationId = headers?.['x-correlation-id'] || 'unknown';

    try {
      this.logger.debug(`Forwarding ${method} ${url} [${correlationId}]`);

      const response = await axios({
        method: method as any,
        url,
        data,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds
        validateStatus: status => status < 500, // Don't throw for 4xx errors
      });

      this.logger.debug(`Response from ${serviceName}: ${response.status} [${correlationId}]`);
      return response;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        this.logger.error(`Service ${serviceName} is unavailable at ${url} [${correlationId}]`);
        throw new Error(`Service ${serviceName} is currently unavailable`);
      }

      if (error.response) {
        this.logger.error(
          `Service ${serviceName} returned error: ${error.response.status} [${correlationId}]`,
        );
        return error.response;
      }

      this.logger.error(`Request to ${serviceName} failed: ${error.message} [${correlationId}]`);
      throw error;
    }
  }

  getServiceUrl(serviceName: string): string {
    return this.serviceUrls[serviceName] || '';
  }
}
