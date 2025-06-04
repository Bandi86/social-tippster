import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateTipDto } from './dto/create-tip.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { LeaderboardEntryDto, SetTipResultDto, UserTipStatsDto } from './dto/tip-result.dto';
import { PostType } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { TipsService } from './tips.service';

@ApiTags('tips')
@Controller('tips')
export class TipsController {
  constructor(
    private readonly tipsService: TipsService,
    private readonly postsService: PostsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tip' })
  @ApiResponse({ status: 201, description: 'Tip created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createTip(@Body() createTipDto: CreateTipDto, @CurrentUser() user: User) {
    try {
      return await this.tipsService.createTip(createTipDto, user.user_id);
    } catch (error) {
      throw new BadRequestException((error as Error)?.message || 'Failed to create tip');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all tips with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Tips retrieved successfully' })
  async getAllTips(@Query() queryDto: GetPostsQueryDto) {
    // Filter to only show tips
    const tipQuery = { ...queryDto, type: PostType.TIP };
    return await this.postsService.findAllPosts(tipQuery);
  }

  @Get('my-performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user tip performance statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: UserTipStatsDto,
  })
  async getMyPerformance(@CurrentUser() user: User): Promise<UserTipStatsDto> {
    return await this.tipsService.getUserTipStats(user.user_id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get tips leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    type: [LeaderboardEntryDto],
  })
  async getLeaderboard(@Query('limit') limit?: number): Promise<LeaderboardEntryDto[]> {
    const leaderboardLimit = limit && limit > 0 && limit <= 100 ? limit : 50;
    return await this.tipsService.getLeaderboard(leaderboardLimit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get overall tip statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    // This could include platform-wide statistics
    return {
      message: 'Tip statistics endpoint - to be implemented',
      // TODO: Implement platform-wide tip statistics
    };
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate a tip before creation' })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  validateTip(@Body() createTipDto: CreateTipDto) {
    return this.tipsService.validateTip(createTipDto);
  }

  @Post('check-deadline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check submission deadlines for tips' })
  @ApiResponse({ status: 200, description: 'Deadline check completed' })
  async checkDeadlines() {
    await this.tipsService.checkDeadlines();
    return { message: 'Deadline check completed successfully' };
  }

  @Post(':id/result')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set tip result' })
  @ApiResponse({ status: 200, description: 'Tip result set successfully' })
  @ApiResponse({ status: 404, description: 'Tip not found' })
  @ApiResponse({ status: 400, description: 'Result already set or invalid data' })
  async setTipResult(
    @Param('id') tipId: string,
    @Body() setResultDto: SetTipResultDto,
    @CurrentUser() user: User,
  ) {
    return await this.tipsService.setTipResult(tipId, setResultDto, user.user_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific tip by ID' })
  @ApiResponse({ status: 200, description: 'Tip retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tip not found' })
  async getTipById(@Param('id') id: string) {
    return await this.postsService.findPostById(id);
  }
}
