import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiBody({ type: CreatePostDto })
  async createPost(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ): Promise<PostEntity> {
    return await this.postsService.createPost(createPostDto, user.user_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: [PostEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid query parameters' })
  async findAllPosts(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: GetPostsQueryDto,
  ) {
    return await this.postsService.findAllPosts(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 200, description: 'Post found', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findPostById(@Param('id', ParseUUIDPipe) id: string): Promise<PostEntity | null> {
    return await this.postsService.findPostById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update post (author only)' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own posts',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updatePostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ): Promise<PostEntity | null> {
    // First get the post to check ownership
    const existingPost = await this.postsService.findPostById(id);
    if (!existingPost) {
      return null;
    }

    // Authorization: User can only update their own posts
    if (existingPost.author_id !== user.user_id) {
      throw new ForbiddenException('Csak a saját posztjaidat módosíthatod');
    }

    return await this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post (author or admin only)' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own posts or admin required',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    // First get the post to check ownership
    const existingPost = await this.postsService.findPostById(id);
    if (!existingPost) {
      return;
    }

    // Authorization: User can delete their own posts OR admin can delete any post
    const isOwner = existingPost.author_id === user.user_id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Csak a saját posztjaidat törölheted, vagy admin jogosultság szükséges',
      );
    }

    return await this.postsService.deletePost(id);
  }

  // --- Post View Tracking ---
  @Post(':id/view')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a post view (anonymous or authenticated)' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 201, description: 'View tracked successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async trackPostView(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ): Promise<{ success: boolean }> {
    try {
      await this.postsService.trackView(id, user);
      return { success: true };
    } catch (err) {
      if (err instanceof Error && err.message === 'Post not found') {
        throw new NotFoundException('Post not found');
      }
      throw err;
    }
  }

  // --- Post Interactions ---
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 201, description: 'Post liked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async likePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    try {
      await this.postsService.likePost(id, user.user_id);
      return { success: true };
    } catch (err) {
      if (err instanceof Error && err.message === 'Post not found') {
        throw new NotFoundException('Post not found');
      }
      throw err;
    }
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove like from a post' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 204, description: 'Like removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async unlikePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    try {
      await this.postsService.unlikePost(id, user.user_id);
    } catch (err) {
      if (err instanceof Error && err.message === 'Post not found') {
        throw new NotFoundException('Post not found');
      }
      throw err;
    }
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bookmark a post' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 201, description: 'Post bookmarked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async bookmarkPost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    try {
      await this.postsService.bookmarkPost(id, user.user_id);
      return { success: true };
    } catch (err) {
      if (err instanceof Error && err.message === 'Post not found') {
        throw new NotFoundException('Post not found');
      }
      throw err;
    }
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove bookmark from a post' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 204, description: 'Bookmark removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async unbookmarkPost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    try {
      await this.postsService.unbookmarkPost(id, user.user_id);
    } catch (err) {
      if (err instanceof Error && err.message === 'Post not found') {
        throw new NotFoundException('Post not found');
      }
      throw err;
    }
  }

  // TODO: Implement controller endpoints for comment system
  // TODO: Implement controller endpoints for post statistics and analytics
}
