import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Social Tippster API')
    .setDescription('API dokumentáció a Social Tippster alkalmazáshoz')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('posts', 'Post management')
    .addTag('tips', 'Betting tips')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh token cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3001);
  const baseUrl = `http://localhost:3001`;
  console.log(`Application is running on: ${baseUrl}`);
  console.log(`Swagger documentation available at: ${baseUrl}/api/docs`);
}

(async () => {
  await bootstrap();
})().catch(err => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
