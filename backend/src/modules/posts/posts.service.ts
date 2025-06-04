import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BettingSlipData,
  ImageProcessingService,
} from '../image-analysis/image-processing.service';
import { CreatePostDto, PostType as DtoPostType } from './dto/create-post.dto';
import { FilterPostsDto, SearchPostsDto } from './dto/filter-posts.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import {
  Post,
  PostBookmark,
  PostComment,
  PostCommentVote,
  PostReport,
  PostShare,
  PostType,
  PostView,
  PostVote,
  TipResult,
} from './entities';
import { ReportReason, ReportStatus } from './entities/post-report.entity';
import { SharePlatform } from './entities/post-share.entity';
import { VoteType } from './entities/post-vote.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

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
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  async createPost(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      author_id: authorId,
    });
    return await this.postRepository.save(post);
  }

  /**
   * Create post with automatic betting slip processing
   */
  async createPostWithBettingSlip(
    createPostDto: CreatePostDto & { imageUrl?: string },
    authorId: string,
  ): Promise<{
    post: Post | null;
    bettingSlipData?: BettingSlipData;
    validationResult?: any;
    errors?: string[];
  }> {
    const result: {
      post: Post | null;
      bettingSlipData?: BettingSlipData;
      validationResult?: any;
      errors?: string[];
    } = {
      post: null,
      bettingSlipData: undefined,
      validationResult: undefined,
      errors: undefined,
    };

    try {
      // Process betting slip if image is provided
      if (createPostDto.imageUrl && createPostDto.type === DtoPostType.TIP) {
        this.logger.log('Processing betting slip for new post...');

        // Extract image path from URL (assuming local uploads)
        const imagePath = createPostDto.imageUrl.replace('/uploads/', '../../uploads/');

        // Process the betting slip image
        const bettingSlipResult =
          await this.imageProcessingService.processBettingSlipImage(imagePath);

        if (bettingSlipResult.success && bettingSlipResult.data) {
          result.bettingSlipData = bettingSlipResult.data;

          // Auto-populate post fields with extracted data
          const enhancedPostDto = this.mergeExtractedDataWithPost(
            createPostDto,
            bettingSlipResult.data,
          );

          // Create the post with enhanced data
          const post = this.postRepository.create({
            ...enhancedPostDto,
            author_id: authorId,
            is_valid_tip: true,
            validation_errors: [],
          });

          result.post = await this.postRepository.save(post);
        } else {
          // Image processing failed, create post without enhanced tip data
          result.errors = bettingSlipResult.errors || ['Failed to process betting slip'];
          const post = this.postRepository.create({
            ...createPostDto,
            author_id: authorId,
          });
          result.post = await this.postRepository.save(post);
        }
      } else {
        // No image or not a tip post, create normally
        const post = this.postRepository.create({
          ...createPostDto,
          author_id: authorId,
        });
        result.post = await this.postRepository.save(post);
      }

      return result;
    } catch (error) {
      this.logger.error('Error creating post with betting slip:', error);

      // Fallback to creating post without enhancement
      const post = this.postRepository.create({
        ...createPostDto,
        author_id: authorId,
      });
      result.post = await this.postRepository.save(post);
      result.errors = ['Failed to process betting slip, post created without enhancement'];

      return result;
    }
  }

  /**
   * Merge extracted betting slip data with post data
   */
  private mergeExtractedDataWithPost(
    createPostDto: CreatePostDto,
    bettingSlipData: BettingSlipData,
  ): CreatePostDto {
    const merged = { ...createPostDto };

    // Map betting slip data to CreatePostDto fields (camelCase)
    if (bettingSlipData.team1 && bettingSlipData.team2) {
      merged.matchName = `${bettingSlipData.team1} vs ${bettingSlipData.team2}`;
    }

    if (bettingSlipData.matchDate) {
      merged.matchDate = bettingSlipData.matchDate.toISOString();
    }

    if (bettingSlipData.odds) {
      merged.odds = bettingSlipData.odds;
    }

    if (bettingSlipData.stake) {
      merged.stake = bettingSlipData.stake;
    }

    if (bettingSlipData.outcome) {
      merged.outcome = bettingSlipData.outcome;
    }

    if (bettingSlipData.validityTime) {
      merged.expiresAt = bettingSlipData.validityTime.toISOString();
      merged.submissionDeadline = bettingSlipData.validityTime.toISOString();
    }

    // Auto-generate title if not provided
    if (!merged.title && bettingSlipData.team1 && bettingSlipData.team2) {
      merged.title = `${bettingSlipData.team1} vs ${bettingSlipData.team2} - Tip`;
    }

    // Enhance content with extracted data
    if (bettingSlipData.odds || bettingSlipData.stake) {
      const extractedInfo: string[] = [];
      if (bettingSlipData.odds) extractedInfo.push(`Odds: ${bettingSlipData.odds}`);
      if (bettingSlipData.stake) extractedInfo.push(`Stake: ${bettingSlipData.stake}`);
      if (bettingSlipData.maxWinning)
        extractedInfo.push(`Potential Win: ${bettingSlipData.maxWinning}`);

      if (extractedInfo.length > 0) {
        merged.content = `${merged.content || ''}\n\n**Extracted from betting slip:**\n${extractedInfo.join('\n')}`;
      }
    }

    return merged;
  }

  /**
   * Update post tip result after match completion
   */
  async updateTipResult(
    postId: string,
    result: 'win' | 'loss' | 'void',
    actualOdds?: number,
    profit?: number,
  ): Promise<Post> {
    const post = await this.findPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.type !== PostType.TIP) {
      throw new Error('Post is not a tip');
    }

    // Convert string result to TipResult enum
    let tipResult: TipResult;
    switch (result) {
      case 'win':
        tipResult = TipResult.WON;
        break;
      case 'loss':
        tipResult = TipResult.LOST;
        break;
      case 'void':
        tipResult = TipResult.VOID;
        break;
      default:
        tipResult = TipResult.PENDING;
    }

    // Update post with result
    const updatedPost = await this.postRepository.save({
      ...post,
      tip_result: tipResult,
      is_result_set: true,
      tip_resolved_at: new Date(),
      tip_profit: profit || 0,
    });

    return updatedPost;
  }

  /**
   * Get posts with tip statistics
   */
  async getPostsWithTipStats(authorId?: string): Promise<{
    posts: Post[];
    statistics: {
      totalTips: number;
      wonTips: number;
      lostTips: number;
      pendingTips: number;
      winRate: number;
      totalProfit: number;
      averageOdds: number;
    };
  }> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.type = :type', { type: PostType.TIP })
      .andWhere('post.status = :status', { status: 'published' })
      .orderBy('post.created_at', 'DESC');

    if (authorId) {
      queryBuilder.andWhere('post.author_id = :authorId', { authorId });
    }

    const posts = await queryBuilder.getMany();

    // Calculate statistics
    const stats = this.calculateTipStatistics(posts);

    return {
      posts,
      statistics: stats,
    };
  }

  /**
   * Calculate tip statistics from posts
   */
  private calculateTipStatistics(posts: Post[]): {
    totalTips: number;
    wonTips: number;
    lostTips: number;
    pendingTips: number;
    winRate: number;
    totalProfit: number;
    averageOdds: number;
  } {
    const totalTips = posts.length;
    const wonTips = posts.filter(p => p.tip_result === TipResult.WON).length;
    const lostTips = posts.filter(p => p.tip_result === TipResult.LOST).length;
    const pendingTips = posts.filter(
      p => !p.tip_result || p.tip_result === TipResult.PENDING,
    ).length;

    const winRate = totalTips > 0 ? (wonTips / (wonTips + lostTips)) * 100 : 0;

    const totalProfit = posts
      .filter(p => p.tip_profit !== null && p.tip_profit !== undefined)
      .reduce((sum, p) => sum + (p.tip_profit || 0), 0);

    const validOdds = posts.filter(p => p.odds && p.odds > 0);
    const averageOdds =
      validOdds.length > 0
        ? validOdds.reduce((sum, p) => sum + (p.odds || 0), 0) / validOdds.length
        : 0;

    return {
      totalTips,
      wonTips,
      lostTips,
      pendingTips,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      averageOdds: Math.round(averageOdds * 100) / 100,
    };
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
