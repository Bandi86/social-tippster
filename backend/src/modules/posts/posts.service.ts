/**
 * PostsService - Refactored
 * Frissítve: 2025.06.05
 * Megjegyzés: Minden tipp specifikus logika eltávolítva
 */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreatePostDTO } from './dto/create-post.dto';
import { FilterPostsDTO } from './dto/filter-posts.dto';
import { PostBookmark } from './entities/post-bookmark.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostReport, ReportReason, ReportStatus } from './entities/post-report.entity';
import { PostShare, SharePlatform } from './entities/post-share.entity';
import { PostView } from './entities/post-view.entity';
import { PostVote, VoteType } from './entities/post-vote.entity';
import { Post } from './entities/posts.entity';
import { PostStatus, PostType, PostVisibility } from './enums/post.enums';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
    @InjectRepository(PostBookmark)
    private readonly postBookmarkRepository: Repository<PostBookmark>,
    @InjectRepository(PostShare)
    private readonly postShareRepository: Repository<PostShare>,
    @InjectRepository(PostView)
    private readonly postViewRepository: Repository<PostView>,
    @InjectRepository(PostReport)
    private readonly postReportRepository: Repository<PostReport>,
  ) {}

  /**
   * Új poszt létrehozása
   */
  async create(createPostDto: CreatePostDTO, authorId: string, authorName: string): Promise<Post> {
    try {
      const title = this.generateTitleFromContent(createPostDto.content);

      const post = this.postRepository.create({
        ...createPostDto,
        title,
        author_id: authorId,
        created_by: authorName,
        // Default értékek biztosítása
        type: createPostDto.type || PostType.DISCUSSION,
        status: createPostDto.status || PostStatus.PUBLISHED,
        visibility: createPostDto.visibility || PostVisibility.PUBLIC,
        comments_enabled: createPostDto.commentsEnabled ?? true,
        sharing_enabled: createPostDto.sharingEnabled ?? true,
        is_featured: createPostDto.isFeatured ?? false,
        is_pinned: createPostDto.isPinned ?? false,
        is_premium: createPostDto.isPremium ?? false,
        // Counters kezdőértékei
        likes_count: 0,
        comments_count: 0,
        share_count: 0,
        views_count: 0,
      });

      const savedPost = await this.postRepository.save(post);
      this.logger.log(`New post created: ${savedPost.id} by user ${authorId}`);

      return savedPost;
    } catch (error) {
      this.logger.error('Error creating post:', error);
      throw new BadRequestException('Failed to create post');
    }
  }

  /**
   * Posztok listázása szűrőkkel
   */
  async findAll(
    filterDto: FilterPostsDTO,
    userId?: string,
  ): Promise<{ posts: Post[]; total: number }> {
    const queryBuilder = this.createFilteredQuery(filterDto, userId);

    // Pagination
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // Sorting
    const sortBy = filterDto.sortBy || 'created_at';
    const sortOrder = filterDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`post.${sortBy}`, sortOrder);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return { posts, total };
  }

  /**
   * Poszt keresése ID alapján
   */
  async findById(id: string, userId?: string): Promise<Post> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.votes', 'votes')
      .where('post.id = :id', { id })
      .andWhere('post.is_deleted = false');

    // Láthatóság ellenőrzés
    this.applyVisibilityFilter(queryBuilder, userId);

    const post = await queryBuilder.getOne();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Megtekintés számláló növelése
    if (userId) {
      await this.incrementViewCount(id, userId);
    }

    return post;
  }

  /**
   * Poszt frissítése
   */
  async update(id: string, updateData: Partial<CreatePostDTO>, userId: string): Promise<Post> {
    const post = await this.findById(id);

    if (post.author_id !== userId) {
      throw new ForbiddenException('Only the author can update this post');
    }

    // Title újragenerálása ha content változott
    if (updateData.content && updateData.content !== post.content) {
      updateData['title'] = this.generateTitleFromContent(updateData.content);
    }

    Object.assign(post, updateData);
    post.updated_at = new Date();

    const updatedPost = await this.postRepository.save(post);
    this.logger.log(`Post updated: ${id} by user ${userId}`);

    return updatedPost;
  }

  /**
   * Poszt törlése (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const post = await this.findById(id);

    if (post.author_id !== userId) {
      throw new ForbiddenException('Only the author can delete this post');
    }

    await this.postRepository.update(id, {
      is_deleted: true,
      status: PostStatus.DELETED,
      updated_at: new Date(),
    });

    this.logger.log(`Post deleted: ${id} by user ${userId}`);
  }

  /**
   * Poszt like/unlike
   */
  async toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.findById(postId);

    const existingVote = await this.postVoteRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingVote) {
      // Unlike
      await this.postVoteRepository.remove(existingVote);
      post.likes_count = Math.max(0, post.likes_count - 1);
      await this.postRepository.save(post);
      return { liked: false, likesCount: post.likes_count };
    } else {
      // Like
      const vote = this.postVoteRepository.create({
        post_id: postId,
        user_id: userId,
        type: VoteType.LIKE,
      });
      await this.postVoteRepository.save(vote);

      post.likes_count += 1;
      await this.postRepository.save(post);
      return { liked: true, likesCount: post.likes_count };
    }
  }

  /**
   * Poszt könyvjelzőzése
   */
  async toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean }> {
    await this.findById(postId); // Ellenőrzi, hogy létezik-e a poszt

    const existingBookmark = await this.postBookmarkRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingBookmark) {
      await this.postBookmarkRepository.remove(existingBookmark);
      return { bookmarked: false };
    } else {
      const bookmark = this.postBookmarkRepository.create({
        post_id: postId,
        user_id: userId,
      });
      await this.postBookmarkRepository.save(bookmark);
      return { bookmarked: true };
    }
  }

  /**
   * Poszt megosztása
   */
  async sharePost(
    postId: string,
    platform: string,
    userId: string,
  ): Promise<{ shareCount: number }> {
    const post = await this.findById(postId);

    if (!post.sharing_enabled) {
      throw new ForbiddenException('Sharing is disabled for this post');
    }

    const share = this.postShareRepository.create({
      post_id: postId,
      user_id: userId,
      platform: platform as SharePlatform,
    });
    await this.postShareRepository.save(share);

    post.share_count += 1;
    await this.postRepository.save(post);

    return { shareCount: post.share_count };
  }

  /**
   * Poszt jelentése
   */
  async reportPost(postId: string, reason: string, userId: string): Promise<void> {
    await this.findById(postId); // Ellenőrzi, hogy létezik-e a poszt

    const existingReport = await this.postReportRepository.findOne({
      where: { post_id: postId, reporter_id: userId },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this post');
    }

    const report = this.postReportRepository.create({
      post_id: postId,
      reporter_id: userId,
      reason: reason as ReportReason,
      status: ReportStatus.PENDING,
    });

    await this.postReportRepository.save(report);
    this.logger.log(`Post reported: ${postId} by user ${userId}, reason: ${reason}`);
  }

  /**
   * Felhasználó posztjai
   */
  async getUserPosts(
    userId: string,
    filterDto: FilterPostsDTO,
  ): Promise<{ posts: Post[]; total: number }> {
    const modifiedFilter = { ...filterDto, author: userId };
    return this.findAll(modifiedFilter, userId);
  }

  /**
   * Privát segéd metódusok
   */
  private generateTitleFromContent(content: string): string {
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    const maxLength = 100;

    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }

    const truncated = cleanContent.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 50 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  private createFilteredQuery(
    filterDto: FilterPostsDTO,
    userId?: string,
  ): SelectQueryBuilder<Post> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.is_deleted = false');

    // Láthatóság szűrés
    this.applyVisibilityFilter(queryBuilder, userId);

    // Szűrők alkalmazása
    if (filterDto.type) {
      queryBuilder.andWhere('post.type = :type', { type: filterDto.type });
    }

    if (filterDto.status) {
      queryBuilder.andWhere('post.status = :status', { status: filterDto.status });
    }

    if (filterDto.visibility) {
      queryBuilder.andWhere('post.visibility = :visibility', { visibility: filterDto.visibility });
    }

    if (filterDto.category) {
      queryBuilder.andWhere('post.category_id = :categoryId', { categoryId: filterDto.category });
    }

    if (filterDto.author) {
      queryBuilder.andWhere('post.author_id = :authorId', { authorId: filterDto.author });
    }

    if (filterDto.tags && filterDto.tags.length > 0) {
      queryBuilder.andWhere('post.tags && :tags', { tags: filterDto.tags });
    }

    if (filterDto.isFeatured !== undefined) {
      queryBuilder.andWhere('post.is_featured = :isFeatured', { isFeatured: filterDto.isFeatured });
    }

    if (filterDto.isPremium !== undefined) {
      queryBuilder.andWhere('post.is_premium = :isPremium', { isPremium: filterDto.isPremium });
    }

    // Dátum szűrők
    if (filterDto.createdAtFrom) {
      queryBuilder.andWhere('post.created_at >= :createdAtFrom', {
        createdAtFrom: filterDto.createdAtFrom,
      });
    }

    if (filterDto.createdAtTo) {
      queryBuilder.andWhere('post.created_at <= :createdAtTo', {
        createdAtTo: filterDto.createdAtTo,
      });
    }

    // Számláló szűrők
    if (filterDto.likesCountMin !== undefined) {
      queryBuilder.andWhere('post.likes_count >= :likesCountMin', {
        likesCountMin: filterDto.likesCountMin,
      });
    }

    if (filterDto.likesCountMax !== undefined) {
      queryBuilder.andWhere('post.likes_count <= :likesCountMax', {
        likesCountMax: filterDto.likesCountMax,
      });
    }

    return queryBuilder;
  }

  private applyVisibilityFilter(queryBuilder: SelectQueryBuilder<Post>, userId?: string): void {
    if (!userId) {
      // Nem bejelentkezett felhasználó - csak publikus posztok
      queryBuilder.andWhere('post.visibility = :publicVisibility', {
        publicVisibility: PostVisibility.PUBLIC,
      });
      queryBuilder.andWhere('post.status = :publishedStatus', {
        publishedStatus: PostStatus.PUBLISHED,
      });
    } else {
      // Bejelentkezett felhasználó - saját posztok + publikus + regisztrált felhasználóknak szóló
      queryBuilder.andWhere(
        '(post.author_id = :userId OR post.visibility IN (:...allowedVisibilities))',
        {
          userId,
          allowedVisibilities: [
            PostVisibility.PUBLIC,
            PostVisibility.REGISTERED_ONLY,
            PostVisibility.FOLLOWERS_ONLY,
          ],
        },
      );
    }
  }

  private async incrementViewCount(postId: string, userId: string): Promise<void> {
    const existingView = await this.postViewRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (!existingView) {
      const view = this.postViewRepository.create({
        post_id: postId,
        user_id: userId,
      });
      await this.postViewRepository.save(view);

      await this.postRepository.increment({ id: postId }, 'views_count', 1);
    }
  }
}
