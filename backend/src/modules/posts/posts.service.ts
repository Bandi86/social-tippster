import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import {
  Post,
  PostBookmark,
  PostComment,
  PostCommentVote,
  PostShare,
  PostView,
  PostVote,
} from './entities';
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
}
