/* import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostService, PostQueryOptions } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity, PostType, PostStatus, PostVisibility } from './entities/post.entity';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post successfully created', type: PostEntity })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: PostType })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'visibility', required: false, enum: PostVisibility })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'likesCount', 'viewsCount', 'commentsCount'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async findAll(@Query() query: PostQueryOptions) {
    return this.postService.findAll(query);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get public feed posts' })
  @ApiResponse({ status: 200, description: 'Feed posts retrieved successfully' })
  async getFeed(@Query() query: PostQueryOptions) {
    return this.postService.getFeedPosts(query);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular posts by likes' })
  @ApiResponse({ status: 200, description: 'Popular posts retrieved successfully' })
  async getPopular(@Query() query: PostQueryOptions) {
    return this.postService.getPopularPosts(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending posts by views' })
  @ApiResponse({ status: 200, description: 'Trending posts retrieved successfully' })
  async getTrending(@Query() query: PostQueryOptions) {
    return this.postService.getTrendingPosts(query);
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get scheduled posts ready for publishing' })
  @ApiResponse({ status: 200, description: 'Scheduled posts retrieved successfully' })
  async getScheduled() {
    return this.postService.getScheduledPosts();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search posts by content' })
  @ApiResponse({ status: 200, description: 'Search results', type: [PostEntity] })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  async searchPosts(
    @Query('q') query: string,
    @Query() options: PostQueryOptions,
  ) {
    return this.postService.searchPosts(query, options);
  }

  @Get('by-tags')
  @ApiOperation({ summary: 'Get posts by tags' })
  @ApiResponse({ status: 200, description: 'Posts by tags retrieved successfully' })
  @ApiQuery({ name: 'tags', required: true, type: [String], description: 'Tags to filter by' })
  async getByTags(
    @Query('tags') tags: string[],
    @Query() options: PostQueryOptions,
  ) {
    return this.postService.getPostsByTags(Array.isArray(tags) ? tags : [tags], options);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get posts by user ID' })
  @ApiResponse({ status: 200, description: 'User posts retrieved successfully' })
  async getByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PostQueryOptions,
  ) {
    return this.postService.getPostsByUser(userId, query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get post by slug' })
  @ApiResponse({ status: 200, description: 'Post found', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findBySlug(@Param('slug') slug: string): Promise<PostEntity> {
    // Increment views when accessing by slug (likely public access)
    const post = await this.postService.findBySlug(slug);
    await this.postService.incrementViews(post.id);
    return post;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post found', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    const post = await this.postService.findOne(id);
    await this.postService.incrementViews(id);
    return post;
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get post statistics' })
  @ApiResponse({ status: 200, description: 'Post statistics retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPostStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post successfully updated', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not post owner' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<PostEntity> {
    const requestUserId = userId ? parseInt(userId) : undefined;
    return this.postService.update(id, updatePostDto, requestUserId);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a scheduled post' })
  @ApiResponse({ status: 200, description: 'Post published successfully' })
  @ApiResponse({ status: 400, description: 'Post is not scheduled for publishing' })
  async publishScheduled(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.publishScheduledPost(id);
  }

  @Patch(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment post likes count' })
  @ApiResponse({ status: 204, description: 'Likes count incremented' })
  async incrementLikes(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postService.incrementLikes(id);
  }

  @Patch(':id/unlike')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decrement post likes count' })
  @ApiResponse({ status: 204, description: 'Likes count decremented' })
  async decrementLikes(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postService.decrementLikes(id);
  }

  @Patch(':id/comment/increment')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment post comments count' })
  @ApiResponse({ status: 204, description: 'Comments count incremented' })
  async incrementComments(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postService.incrementComments(id);
  }

  @Patch(':id/comment/decrement')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decrement post comments count' })
  @ApiResponse({ status: 204, description: 'Comments count decremented' })
  async decrementComments(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postService.decrementComments(id);
  }

  @Patch(':id/share')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment post shares count' })
  @ApiResponse({ status: 204, description: 'Shares count incremented' })
  async incrementShares(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postService.incrementShares(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 204, description: 'Post successfully deleted' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not post owner' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userId?: string,
  ): Promise<void> {
    const requestUserId = userId ? parseInt(userId) : undefined;
    return this.postService.remove(id, requestUserId);
  }
} */

import { Controller } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
}
