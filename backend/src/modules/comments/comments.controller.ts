import {
  Body,
  Controller,
  Delete,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CommentsService } from './comments.service';
import {
  CommentResponseDto,
  CommentVoteDto,
  CreateCommentDto,
  ListCommentsQueryDto,
  ReportCommentDto,
  UpdateCommentDto,
} from './dto/index.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new comment',
    description: 'Create a new comment or reply to an existing comment',
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Post or parent comment not found' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(createCommentDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get comments with pagination and filtering',
    description: 'Retrieve comments with optional filtering by post or parent comment',
  })
  @ApiQuery({ name: 'postId', required: false, description: 'Filter by post ID' })
  @ApiQuery({
    name: 'parentCommentId',
    required: false,
    description: 'Filter by parent comment ID',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order: asc or desc (default: desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/CommentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: ListCommentsQueryDto) {
    return this.commentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Comment found',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id);
  }

  @Get(':id/replies')
  @ApiOperation({
    summary: 'Get replies to a comment',
    description: 'Get all replies to a specific comment with pagination',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order: asc or desc (default: asc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Replies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/CommentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getReplies(@Param('id', ParseUUIDPipe) id: string, @Query() query: ListCommentsQueryDto) {
    return await this.commentsService.getReplies(id, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update comment (author only)',
    description: 'Update comment content - only the comment author can edit',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own comments',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: User,
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete comment (author or admin only)',
    description: 'Delete a comment - only the author or admin can delete',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own comments or admin required',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.commentsService.remove(id, user);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Vote on comment',
    description: 'Upvote or downvote a comment. Voting again with same value toggles it off.',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: {
          type: 'number',
          enum: [1, -1],
          description: 'Vote value: 1 for upvote, -1 for downvote',
        },
      },
      required: ['value'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vote recorded successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async vote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() voteData: { value: number },
    @CurrentUser() user: User,
  ): Promise<CommentResponseDto> {
    const commentVoteDto: CommentVoteDto = {
      commentId: id,
      value: voteData.value as 1 | -1,
    };
    return await this.commentsService.vote(commentVoteDto, user);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Report comment',
    description: 'Report a comment for inappropriate content',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          maxLength: 500,
          description: 'Reason for reporting the comment',
        },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Comment reported successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 400, description: 'Comment already reported by this user' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async report(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reportData: { reason: string },
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    const reportCommentDto: ReportCommentDto = {
      commentId: id,
      reason: reportData.reason,
    };
    return await this.commentsService.report(reportCommentDto, user);
  }

  @Post(':id/flag')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Flag comment (admin only)',
    description: 'Flag a comment as inappropriate - admin only action',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          maxLength: 500,
          description: 'Reason for flagging the comment',
        },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Comment flagged successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async flag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() flagData: { reason: string },
    @CurrentUser() user: User,
  ): Promise<CommentResponseDto> {
    return this.commentsService.flag(id, flagData.reason, user);
  }

  @Post(':id/unflag')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unflag comment (admin only)',
    description: 'Remove flag from a comment - admin only action',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Comment unflagged successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async unflag(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<CommentResponseDto> {
    return this.commentsService.unflag(id, user);
  }
}
