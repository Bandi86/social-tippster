import { All, Controller, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('Proxy')
@Controller('api')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('auth/*')
  @ApiOperation({ summary: 'Forward requests to auth service' })
  async forwardToAuth(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('auth', req, res);
  }

  @All('users/*')
  @ApiOperation({ summary: 'Forward requests to user service' })
  async forwardToUser(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('user', req, res);
  }

  @All('posts/*')
  @ApiOperation({ summary: 'Forward requests to post service' })
  async forwardToPost(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('post', req, res);
  }

  @All('tipps/*')
  @ApiOperation({ summary: 'Forward requests to tipp service' })
  async forwardToTipp(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('tipp', req, res);
  }

  @All('comments/*')
  @ApiOperation({ summary: 'Forward requests to comment service' })
  async forwardToComment(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('comment', req, res);
  }

  @All('notifications/*')
  @ApiOperation({ summary: 'Forward requests to notification service' })
  async forwardToNotification(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('notification', req, res);
  }

  @All('uploads/*')
  @ApiOperation({ summary: 'Forward requests to upload service' })
  async forwardToUpload(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('upload', req, res);
  }

  @All('image-analysis/*')
  @ApiOperation({ summary: 'Forward requests to image analysis service' })
  async forwardToImageAnalysis(@Req() req: Request, @Res() res: Response) {
    return this.forwardRequest('image-analysis', req, res);
  }

  private async forwardRequest(serviceName: string, req: Request, res: Response) {
    try {
      const path = req.path.replace(`/api/${serviceName}`, '');
      const headers = { ...req.headers };
      delete headers.host;

      const response = await this.proxyService.forwardRequest(
        serviceName,
        path,
        req.method,
        req.body,
        headers as Record<string, string>,
      );

      res.status(response.status);
      Object.keys(response.headers).forEach(key => {
        if (key !== 'content-encoding' && key !== 'content-length') {
          res.set(key, response.headers[key]);
        }
      });

      return res.send(response.data);
    } catch (error) {
      if (error.response) {
        res.status(error.response.status);
        return res.send(error.response.data);
      }

      throw new HttpException(
        `Service ${serviceName} unavailable`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
