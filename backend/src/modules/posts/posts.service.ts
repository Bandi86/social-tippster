import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { FilterPostsDto, SearchPostsDto } from './dto/filter-posts.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import {
  Post,
  PostBookmark,
  PostComment,
  PostCommentVote,
  PostReport,
  PostShare,
  PostView,
  PostVote,
} from './entities';
import { ReportReason, ReportStatus } from './entities/post-report.entity';
import { SharePlatform } from './entities/post-share.entity';
import { VoteType } from './entities/post-vote.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
    @InjectRepository(PostBookmark)
    private readonly postBookmarkRepository: Repository<PostBookmark>,
    @InjectRepository(PostShare)
    private readonly postShareRepository: Repository<PostShare>,
    @InjectRepository(PostView)
    private readonly postViewRepository: Repository<PostView>,
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
    @InjectRepository(PostCommentVote)
    private readonly postCommentVoteRepository: Repository<PostCommentVote>,
    @InjectRepository(PostReport)
    private readonly postReportRepository: Repository<PostReport>,
  ) {}

  async createPost(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      author_id: authorId,
    });
    return await this.postRepository.save(post);
  }

  async findAllPosts(queryDto?: GetPostsQueryDto): Promise<{ posts: Post[]; total: number }> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' })
      .orderBy('post.created_at', 'DESC');

    // Apply pagination
    if (queryDto?.limit && typeof queryDto.limit === 'number') {
      queryBuilder.limit(queryDto.limit);
    }

    if (queryDto?.page && typeof queryDto.page === 'number') {
      const offset = (queryDto.page - 1) * (queryDto.limit || 10);
      queryBuilder.offset(offset);
    }

    // Apply category filter
    if (queryDto?.category) {
      queryBuilder.andWhere('post.category = :category', { category: queryDto.category });
    }

    // Apply type filter
    if (queryDto?.type) {
      queryBuilder.andWhere('post.type = :type', { type: queryDto.type });
    }

    // Apply author filter
    if (queryDto?.authorId) {
      queryBuilder.andWhere('post.author_id = :authorId', { authorId: queryDto.authorId });
    }

    // Apply search filter
    if (queryDto?.search) {
      queryBuilder.andWhere('(post.title ILIKE :search OR post.content ILIKE :search)', {
        search: `%${queryDto.search}%`,
      });
    }

    // Apply tags filter
    if (queryDto?.tags && queryDto.tags.length > 0) {
      queryBuilder.andWhere('post.tags @> :tags', { tags: queryDto.tags });
    }

    const [posts, total] = await queryBuilder.getManyAndCount();
    return { posts, total };
  }

  async findPostById(id: string): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async updatePost(id: string, updatePostDto: Partial<Post>): Promise<Post | null> {
    await this.postRepository.update(id, updatePostDto);
    return await this.findPostById(id);
  }

  async deletePost(id: string): Promise<void> {
    await this.postRepository.update(id, { deleted_at: new Date() });
  }

  async trackView(
    postId: string,
    user?: import('../users/entities/user.entity').User,
  ): Promise<void> {
    // Find the post
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Create a new PostView entity
    const postView = this.postViewRepository.create({
      post_id: postId,
      user_id: user && user.user_id ? user.user_id : undefined,
      // Optionally: ip_address, user_agent, referrer can be added from request headers if needed
      is_unique: false, // For now, always false
    });
    await this.postViewRepository.save(postView);

    // Increment views_count on the post
    await this.postRepository.increment({ id: postId }, 'views_count', 1);
  }

  async toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likes_count: number }> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Check if user already liked this post
    const existingLike = await this.postVoteRepository.findOne({
      where: { post_id: postId, user_id: userId, type: VoteType.LIKE },
    });

    if (existingLike) {
      // Unlike: remove the vote
      await this.postVoteRepository.remove(existingLike);
      await this.postRepository.decrement({ id: postId }, 'likes_count', 1);

      // Get updated count
      const updatedPost = await this.postRepository.findOne({ where: { id: postId } });
      return { liked: false, likes_count: updatedPost?.likes_count || 0 };
    } else {
      // Like: create a new vote
      const newLike = this.postVoteRepository.create({
        post_id: postId,
        user_id: userId,
        type: VoteType.LIKE,
      });
      await this.postVoteRepository.save(newLike);
      await this.postRepository.increment({ id: postId }, 'likes_count', 1);

      // Get updated count
      const updatedPost = await this.postRepository.findOne({ where: { id: postId } });
      return { liked: true, likes_count: updatedPost?.likes_count || 0 };
    }
  }

  async toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean }> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Check if user already bookmarked this post
    const existingBookmark = await this.postBookmarkRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingBookmark) {
      // Remove bookmark
      await this.postBookmarkRepository.remove(existingBookmark);
      return { bookmarked: false };
    } else {
      // Add bookmark
      const newBookmark = this.postBookmarkRepository.create({
        post_id: postId,
        user_id: userId,
      });
      await this.postBookmarkRepository.save(newBookmark);
      return { bookmarked: true };
    }
  }

  // New separate methods for API endpoints
  async likePost(postId: string, userId: string): Promise<void> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Check if user already liked this post
    const existingLike = await this.postVoteRepository.findOne({
      where: { post_id: postId, user_id: userId, type: VoteType.LIKE },
    });

    if (!existingLike) {
      // Create a new like vote
      const newLike = this.postVoteRepository.create({
        post_id: postId,
        user_id: userId,
        type: VoteType.LIKE,
      });
      await this.postVoteRepository.save(newLike);
      await this.postRepository.increment({ id: postId }, 'likes_count', 1);
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Check if user liked this post
    const existingLike = await this.postVoteRepository.findOne({
      where: { post_id: postId, user_id: userId, type: VoteType.LIKE },
    });

    if (existingLike) {
      // Remove the like vote
      await this.postVoteRepository.remove(existingLike);
      await this.postRepository.decrement({ id: postId }, 'likes_count', 1);
    }
  }

  async bookmarkPost(postId: string, userId: string): Promise<void> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Check if user already bookmarked this post
    const existingBookmark = await this.postBookmarkRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (!existingBookmark) {
      // Add bookmark
      const newBookmark = this.postBookmarkRepository.create({
        post_id: postId,
        user_id: userId,
      });
      await this.postBookmarkRepository.save(newBookmark);
    }
  }

  async unbookmarkPost(postId: string, userId: string): Promise<void> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Check if user bookmarked this post
    const existingBookmark = await this.postBookmarkRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingBookmark) {
      // Remove bookmark
      await this.postBookmarkRepository.remove(existingBookmark);
    }
  }

  // TODO: Implement service methods for comment system

  // Share functionality
  async sharePost(
    postId: string,
    userId: string,
    platform: string,
    additionalData?: string,
  ): Promise<{ success: boolean; shareUrl: string; shareId: string }> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Validate platform
    if (!Object.values(SharePlatform).includes(platform as SharePlatform)) {
      throw new Error('Invalid share platform');
    }

    // Create a new share record
    const newShare = this.postShareRepository.create({
      user_id: userId,
      post_id: postId,
      platform: platform as SharePlatform,
      additional_data: additionalData || undefined,
      // TODO: Add IP address and user agent from request if needed
    });

    const savedShare = await this.postShareRepository.save(newShare);

    // Increment shares count on the post
    await this.postRepository.increment({ id: postId }, 'shares_count', 1);

    // Generate a share URL (you can customize this based on platform)
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/posts/${postId}`;

    return {
      success: true,
      shareUrl,
      shareId: savedShare.id,
    };
  }

  // Report functionality
  async reportPost(
    postId: string,
    userId: string,
    reason: string,
    additionalDetails?: string,
  ): Promise<{ success: boolean; reportId: string }> {
    // Check if post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    // Validate reason
    if (!Object.values(ReportReason).includes(reason as ReportReason)) {
      throw new Error('Invalid report reason');
    }

    // Check if user already reported this post
    const existingReport = await this.postReportRepository.findOne({
      where: { post_id: postId, reporter_id: userId },
    });

    if (existingReport) {
      throw new Error('You have already reported this post');
    }

    // Create a new report record
    const newReport = this.postReportRepository.create({
      reporter_id: userId,
      post_id: postId,
      reason: reason as ReportReason,
      status: ReportStatus.PENDING,
      additional_details: additionalDetails || undefined,
      // TODO: Add IP address and user agent from request if needed
    });

    const savedReport = await this.postReportRepository.save(newReport);

    // Update post reporting status
    await this.postRepository.update(postId, {
      is_reported: true,
      reports_count: () => 'reports_count + 1',
    });

    return {
      success: true,
      reportId: savedReport.id,
    };
  }

  // Search and filter methods
  async searchPosts(searchDto: SearchPostsDto): Promise<{ posts: Post[]; total: number }> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' })
      .andWhere('(post.title ILIKE :query OR post.content ILIKE :query)', {
        query: `%${searchDto.query}%`,
      })
      .orderBy('post.created_at', 'DESC');

    const limit = searchDto.limit || 20;
    const offset = searchDto.offset || 0;

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const [posts, total] = await queryBuilder.getManyAndCount();
    return { posts, total };
  }

  async filterPosts(
    filters: FilterPostsDto,
    options?: { limit?: number; offset?: number },
  ): Promise<{ posts: Post[]; total: number }> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' });

    // Apply filters
    if (filters.category) {
      queryBuilder.andWhere('post.category = :category', { category: filters.category as string });
    }

    if (filters.type) {
      queryBuilder.andWhere('post.type = :type', { type: filters.type });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('post.created_at >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('post.created_at <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('post.tags @> :tags', { tags: filters.tags });
    }

    if (filters.minLikes) {
      queryBuilder.andWhere('post.likes_count >= :minLikes', { minLikes: filters.minLikes });
    }

    if (filters.tipResult) {
      queryBuilder.andWhere('post.tip_result = :tipResult', { tipResult: filters.tipResult });
    }

    queryBuilder.orderBy('post.created_at', 'DESC');

    const limit = options?.limit || filters.limit || 20;
    const offset = options?.offset || filters.offset || 0;

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const [posts, total] = await queryBuilder.getManyAndCount();
    return { posts, total };
  }

  async getPostsByAuthor(
    authorId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ posts: Post[]; total: number }> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' })
      .andWhere('post.author_id = :authorId', { authorId })
      .orderBy('post.created_at', 'DESC');

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const [posts, total] = await queryBuilder.getManyAndCount();
    return { posts, total };
  }
}
