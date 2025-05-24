import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
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
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiBody({ type: Object }) // TODO: Create proper CreatePostDto
  async createPost(
    @Body() createPostDto: Partial<PostEntity>,
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
  async findAllPosts(@Query() queryDto: { limit?: number }) {
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
  @ApiBody({ type: Object }) // TODO: Create proper UpdatePostDto
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own posts',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: Partial<PostEntity>,
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

  // TODO: Implement controller endpoints for post interactions (vote, bookmark, share, view)
  // TODO: Implement controller endpoints for comment system
  // TODO: Implement controller endpoints for post statistics and analytics
}
