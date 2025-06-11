import { All, Controller, Logger, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';

/**
 * Main routing controller for API Gateway
 * Handles all incoming requests and forwards them to appropriate microservices
 */
@Controller()
export class RouteController {
  private readonly logger = new Logger(RouteController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @All('auth/*')
  async forwardToAuth(@Req() req: Request, @Res() res: Response) {
    const path = req.path.replace('/api/auth', '');
    const method = req.method.toUpperCase();

    try {
      const response = await this.proxyService.forwardRequest(
        'auth',
        `/auth${path}`,
        method,
        req.body,
        {
          ...this.sanitizeHeaders(req.headers),
          'x-correlation-id': this.generateCorrelationId(),
        },
      );

      // Forward response
      res.status(response.status);
      if (response.headers['set-cookie']) {
        res.set('set-cookie', response.headers['set-cookie']);
      }
      res.json(response.data);
    } catch (error) {
      this.logger.error(`Failed to forward auth request: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @All('user/*')
  async forwardToUser(@Req() req: Request, @Res() res: Response) {
    const path = req.path.replace('/api/user', '');
    const method = req.method.toUpperCase();

    try {
      const response = await this.proxyService.forwardRequest(
        'user',
        `/user${path}`,
        method,
        req.body,
        {
          ...this.sanitizeHeaders(req.headers),
          'x-correlation-id': this.generateCorrelationId(),
        },
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Failed to forward user request: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @All('post/*')
  async forwardToPost(@Req() req: Request, @Res() res: Response) {
    const path = req.path.replace('/api/post', '');
    const method = req.method.toUpperCase();

    try {
      const response = await this.proxyService.forwardRequest(
        'post',
        `/post${path}`,
        method,
        req.body,
        {
          ...this.sanitizeHeaders(req.headers),
          'x-correlation-id': this.generateCorrelationId(),
        },
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Failed to forward post request: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @All('tipp/*')
  async forwardToTipp(@Req() req: Request, @Res() res: Response) {
    const path = req.path.replace('/api/tipp', '');
    const method = req.method.toUpperCase();

    try {
      const response = await this.proxyService.forwardRequest(
        'tipp',
        `/tipp${path}`,
        method,
        req.body,
        {
          ...this.sanitizeHeaders(req.headers),
          'x-correlation-id': this.generateCorrelationId(),
        },
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Failed to forward tipp request: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @All('comment/*')
  async forwardToComment(@Req() req: Request, @Res() res: Response) {
    const path = req.path.replace('/api/comment', '');
    const method = req.method.toUpperCase();

    try {
      const response = await this.proxyService.forwardRequest(
        'comment',
        `/comment${path}`,
        method,
        req.body,
        {
          ...this.sanitizeHeaders(req.headers),
          'x-correlation-id': this.generateCorrelationId(),
        },
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Failed to forward comment request: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @All('notification/*')
  async forwardToNotification(@Req() req: Request, @Res() res: Response) {
    const path = req.path.replace('/api/notification', '');
    const method = req.method.toUpperCase();

    try {
      const response = await this.proxyService.forwardRequest(
        'notification',
        `/notification${path}`,
        method,
        req.body,
        {
          ...this.sanitizeHeaders(req.headers),
          'x-correlation-id': this.generateCorrelationId(),
        },
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Failed to forward notification request: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.join(', ');
      } else if (value !== undefined) {
        sanitized[key] = String(value);
      }
    }
    return sanitized;
  }
}
