import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Post } from '../entities/posts.entity';

// Extend Express Request to include 'post'
interface PostRequest extends Request {
  post?: Post;
}

@Injectable()
export class PostOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PostRequest>();

    // Type guard for user
    const user = request.user as User | undefined;
    if (!user || typeof user !== 'object' || !('user_id' in user) || !('role' in user)) {
      throw new ForbiddenException('Hitelesítés szükséges');
    }

    // Type guard for params and id
    const params = request.params as { id?: string };
    const postId = params?.id;
    if (!postId || typeof postId !== 'string') {
      throw new ForbiddenException('Post ID szükséges');
    }

    // Find the post
    const post = await this.postRepository.findOne({
      where: { id: postId },
      select: ['id', 'author_id'],
    });

    if (!post) {
      throw new NotFoundException('A poszt nem található');
    }

    // Check ownership or admin role
    const isOwner = post.author_id === user.user_id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Csak a saját posztjaidat módosíthatod, vagy admin jogosultság szükséges',
      );
    }

    // Store post in request for controller use
    request.post = post;

    return true;
  }
}
