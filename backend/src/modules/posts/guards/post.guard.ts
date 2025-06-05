/**
 * PostGuard - Poszt jogosultság ellenőrzés
 * Frissítve: 2025.06.05
 * Megjegyzés: Tiszta poszt jogosultságok, tipp specifikus logika nélkül
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostStatus, PostVisibility } from '../enums/post.enums';
import { PostsService } from '../posts.service';

@Injectable()
export class PostGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user
      ? (request.user as { id: string; role: string; isPremium?: boolean })
      : null;
    const postId = request.params.id;

    if (!postId) {
      return true; // Ha nincs post ID, akkor általános jogosultság ellenőrzés
    }

    const post = await this.postsService.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Admin mindig hozzáférhet
    if (user?.role === 'admin') {
      return true;
    }

    // Törölt poszt ellenőrzés
    if (post.is_deleted) {
      throw new NotFoundException('Post not found');
    }

    // Jelentett poszt ellenőrzés
    if (post.is_reported && post.author_id !== user?.id) {
      throw new ForbiddenException('This post has been reported and is under review');
    }

    // Státusz ellenőrzés
    if (post.status === PostStatus.DRAFT) {
      if (post.author_id !== user?.id) {
        throw new ForbiddenException('Cannot access draft posts of other users');
      }
    }

    if (post.status === PostStatus.PRIVATE) {
      if (post.author_id !== user?.id) {
        throw new ForbiddenException('Cannot access private posts of other users');
      }
    }

    if (post.status === PostStatus.ARCHIVED) {
      // Archivált posztok csak olvashatóak, nem szerkeszthetőek
      const method = request.method;
      if (['PUT', 'PATCH', 'DELETE'].includes(method) && post.author_id !== user?.id) {
        throw new ForbiddenException('Cannot modify archived posts');
      }
    }

    // Láthatóság ellenőrzés
    if (
      post.visibility === PostVisibility.PRIVATE ||
      post.visibility === PostVisibility.AUTHOR_ONLY
    ) {
      if (post.author_id !== user?.id) {
        throw new ForbiddenException('Cannot access private posts');
      }
    }

    if (
      post.visibility === PostVisibility.REGISTERED_ONLY ||
      post.visibility === PostVisibility.FOLLOWERS_ONLY
    ) {
      if (!user) {
        throw new ForbiddenException('Authentication required to access this post');
      }
    }

    // Premium tartalom ellenőrzés
    if (post.is_premium) {
      if (!user) {
        throw new ForbiddenException('Authentication required for premium content');
      }

      // Itt lehet majd premium subscription ellenőrzés
      if (!user.isPremium && post.author_id !== user.id) {
        throw new ForbiddenException('Premium subscription required to access this content');
      }
    }

    // Szerkesztési jogosultság ellenőrzés
    const method = request.method;
    if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (post.author_id !== user?.id) {
        throw new ForbiddenException('Only the author can modify this post');
      }
    }

    return true;
  }
}
