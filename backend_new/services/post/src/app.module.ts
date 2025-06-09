// Post service app module - To be implemented with Prisma
// This file has been cleared for Prisma-only implementation

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
//import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '.env.docker'],
    }),
    // TODO: Add Prisma configuration here
    PostModule,
    //HealthModule,
  ],
})
export class AppModule {}
