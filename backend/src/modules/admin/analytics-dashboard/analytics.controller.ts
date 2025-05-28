import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User, UserRole } from '../../users/entities/user.entity';
import { AnalyticsService } from './analytics.service';

@Controller('admin/analytics')
@ApiTags('Admin Analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  private checkAdminRole(user: User): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Csak admin jogosultsággal elérhető');
    }
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get post statistics for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Admin post statistics retrieved successfully',
    schema: {
      example: {
        total: 123,
        published: 100,
        draft: 10,
        hidden: 5,
        reported: 2,
        totalViews: 5000,
        totalLikes: 800,
        recentPosts: 7,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  async getAdminPostStats(@CurrentUser() user: User) {
    this.checkAdminRole(user);
    return await this.analyticsService.getAdminPostStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user statistics for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Admin user statistics retrieved successfully',
    schema: {
      example: {
        total: 500,
        active: 300,
        banned: 50,
        unverified: 100,
        admins: 5,
        recentRegistrations: 25,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  async getAdminUserStats(@CurrentUser() user: User) {
    this.checkAdminRole(user);
    return await this.analyticsService.getAdminUserStats();
  }

  @Get('comments')
  @ApiOperation({ summary: 'Get comment statistics for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Admin comment statistics retrieved successfully',
    schema: {
      example: {
        total: 1000,
        active: 800,
        flagged: 50,
        reported: 25,
        recentComments: 150,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  async getAdminCommentStats(@CurrentUser() user: User) {
    this.checkAdminRole(user);
    return await this.analyticsService.getAdminCommentStats();
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Get user growth data for charts' })
  @ApiResponse({
    status: 200,
    description: 'User growth data retrieved successfully',
    schema: {
      example: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 150 },
        { month: 'Mar', users: 200 },
        { month: 'Apr', users: 280 },
        { month: 'May', users: 350 },
        { month: 'Jun', users: 420 },
      ],
    },
  })
  async getUserGrowthData(@CurrentUser() user: User) {
    this.checkAdminRole(user);
    return await this.analyticsService.getUserGrowthData();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get weekly activity data' })
  @ApiResponse({
    status: 200,
    description: 'Activity data retrieved successfully',
    schema: {
      example: [
        { date: 'Mon', logins: 45, registrations: 8 },
        { date: 'Tue', logins: 52, registrations: 12 },
        { date: 'Wed', logins: 38, registrations: 6 },
        { date: 'Thu', logins: 61, registrations: 15 },
        { date: 'Fri', logins: 73, registrations: 22 },
        { date: 'Sat', logins: 35, registrations: 9 },
        { date: 'Sun', logins: 28, registrations: 4 },
      ],
    },
  })
  async getActivityData(@CurrentUser() user: User) {
    this.checkAdminRole(user);
    return await this.analyticsService.getActivityData();
  }

  @Get('comprehensive')
  @ApiOperation({ summary: 'Get comprehensive analytics data for dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive analytics data retrieved successfully',
  })
  async getComprehensiveAnalytics(@CurrentUser() user: User) {
    this.checkAdminRole(user);
    return await this.analyticsService.getComprehensiveAnalytics();
  }
}
