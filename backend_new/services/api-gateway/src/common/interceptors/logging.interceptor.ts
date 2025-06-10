import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Generate correlation ID for request tracking
    const correlationId = uuidv4();
    request['correlationId'] = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    const { method, url, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const start = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url} - ${userAgent} [${correlationId}]`);

    return next.handle().pipe(
      tap({
        next: data => {
          const duration = Date.now() - start;
          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${response.statusCode} - ${duration}ms [${correlationId}]`,
          );
        },
        error: error => {
          const duration = Date.now() - start;
          this.logger.error(
            `Request Error: ${method} ${url} - ${error.status || 500} - ${duration}ms [${correlationId}]`,
            error.stack,
          );
        },
      }),
    );
  }
}
