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
import { LeaderboardEntryDto, SetTipResultDto, UserTipStatsDto } from './dto/tip-result.dto';
import { TippsService } from './tipps.service';

@ApiTags('tipps')
@Controller('tipps')
export class TippsController {
  constructor(private readonly tippsService: TippsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tip' })
  @ApiResponse({ status: 201, description: 'Tip created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createTip(@Body() createTipDto: CreateTipDto, @CurrentUser() user: User) {
    try {
      return await this.tippsService.createTip(createTipDto, user.user_id);
    } catch (error) {
      throw new BadRequestException((error as Error)?.message || 'Failed to create tip');
    }
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
    return await this.tippsService.getUserTipStats(user.user_id);
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
    return await this.tippsService.getLeaderboard(leaderboardLimit);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate a tip before creation' })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  validateTip(@Body() createTipDto: CreateTipDto) {
    return this.tippsService.validateTip(createTipDto);
  }

  @Post('check-deadline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check submission deadlines for tips' })
  @ApiResponse({ status: 200, description: 'Deadline check completed' })
  async checkDeadlines() {
    await this.tippsService.checkDeadlines();
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
    return await this.tippsService.setTipResult(tipId, setResultDto, user.user_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific tip by ID' })
  @ApiResponse({ status: 200, description: 'Tip retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tip not found' })
  async getTipById(@Param('id') id: string) {
    try {
      return await this.tippsService.getTipById(id);
    } catch (error) {
      throw new BadRequestException((error as Error)?.message || 'Failed to get tip');
    }
  }
}
