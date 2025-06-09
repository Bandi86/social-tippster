import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class ProxyService {
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
      'image-analysis': this.configService.get('IMAGE_ANALYSIS_SERVICE_URL', 'http://localhost:3008'),
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
      throw new Error(`Service ${serviceName} not found`);
    }

    const url = `${serviceUrl}${path}`;

    try {
      const response = await axios({
        method: method as any,
        url,
        data,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  getServiceUrl(serviceName: string): string {
    return this.serviceUrls[serviceName] || '';
  }
}
