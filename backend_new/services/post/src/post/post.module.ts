// Post module - To be implemented with Prisma
// This file has been cleared for Prisma-only implementation

import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
//import { HealthService } from 'src/health/health.service';
//import { HealthController } from 'src/health/health.controller';

@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService], // Export PostService so it can be used in other modules
})
export class PostModule {}
