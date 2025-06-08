import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log('🚀 Starting backend server without Sentry integration');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      exceptionFactory(errors) {
        // Log validation errors for debugging
        console.error('Validation error:', errors);
        // Return a BadRequestException with detailed error message
        return new BadRequestException(
          errors
            .map(e => (e.constraints ? Object.values(e.constraints).join('; ') : JSON.stringify(e)))
            .join(' | '),
        );
      },
    }),
  );

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:6006', // Storybook or other local tools
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
      'X-Database-Name', // Allow custom database name header
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Social Platform API')
    .setDescription('API dokumentáció a Social Platform alkalmazáshoz')
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

  // Serve static uploads (profile, posts, etc.)
  const uploadsPath = join(process.cwd(), 'uploads'); // Changed from 'backend', 'uploads'
  console.log(`Static uploads path: ${uploadsPath}`);
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });

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
