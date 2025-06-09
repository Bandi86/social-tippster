import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3007;

  // Enable CORS for the notifications service
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Social Tippster Notification Service')
    .setDescription('Notification Management Service API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable global prefix for API routes
  app.setGlobalPrefix('api');

  // Log the port for debugging
  const logger = new Logger('NotificationsService');

  logger.log('Notifications service is starting...');

  // Listen on the specified port
  await app.listen(port);

  // Start the application on the specified port
  logger.log(`Notifications service is running on http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`CORS enabled for origin: ${process.env.FRONTEND_URL || 'http://localhost:3002'}`);
}
bootstrap();
