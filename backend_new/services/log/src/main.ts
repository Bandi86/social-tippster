import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3012;

  // Enable global prefix for API routes
  app.setGlobalPrefix('api');

  // Enable CORS for the log service
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
  });
  // Log the port for debugging
  const logger = new Logger('LogService');
  logger.log('Log service is starting...');
  // Start the application on the specified port
  logger.log(`Log service is running on http://localhost:${port}`);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Social Tippster Log Service')
    .setDescription('Log Service API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  console.log(`👤 Log Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  Logger.log(`CORS enabled for origin: ${process.env.FRONTEND_URL || 'http://localhost:3002'}`);
}
bootstrap();
