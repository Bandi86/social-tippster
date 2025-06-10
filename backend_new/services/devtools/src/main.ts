import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3033;
  const logger = new Logger('DevToolsMCP');

  logger.log('🛠️  DevTools MCP Server is starting...');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mcp-request'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('DevTools MCP Server')
    .setDescription(
      'Model Context Protocol Server for Docker, Project Management & Development Tools',
    )
    .setVersion('1.0')
    .addTag('docker', 'Docker container management')
    .addTag('project', 'Project monitoring and management')
    .addTag('health', 'Health checks and monitoring')
    .addTag('mcp', 'MCP protocol endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  logger.log(`🚀 DevTools MCP Server running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔍 MCP Protocol: http://localhost:${port}/api/mcp`);
  logger.log(`🐳 Docker API: http://localhost:${port}/api/docker`);
  logger.log(`📊 Project API: http://localhost:${port}/api/project`);
  logger.log(`💚 Health API: http://localhost:${port}/api/health`);
}

bootstrap();
