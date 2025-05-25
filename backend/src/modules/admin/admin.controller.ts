import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
import { GetUsersQueryDto } from '../users/dto/get-users-query.dto';
import { PaginatedUsersResponseDto } from '../users/dto/paginated-users-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

// DTO for changing user role
class ChangeUserRoleDto {
  role: UserRole;
}

// DTO for banning user
class BanUserDto {
  reason?: string;
}

// DTO for admin statistics
class AdminStatsDto {
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  private checkAdminRole(user: User): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin jogosultság szükséges');
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and filtering (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  async getUsers(
    @Query() queryDto: GetUsersQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<PaginatedUsersResponseDto> {
    this.checkAdminRole(currentUser);
    return this.usersService.findAll(queryDto);
  }

  @Get('users/stats')
  @ApiOperation({ summary: 'Get user statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: AdminStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  async getUserStats(@CurrentUser() currentUser: User): Promise<AdminStatsDto> {
    this.checkAdminRole(currentUser);
    return await this.usersService.getAdminStats();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser);
    return this.usersService.findOne(id);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: BanUserDto })
  @ApiResponse({ status: 200, description: 'User banned successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() banDto: BanUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser);
    return this.usersService.banUser(id, banDto.reason);
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Unban user (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async unbanUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser);
    return this.usersService.unbanUser(id);
  }

  @Post('users/:id/verify')
  @ApiOperation({ summary: 'Verify user (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User verified successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser);
    return this.usersService.verifyUser(id);
  }

  @Post('users/:id/unverify')
  @ApiOperation({ summary: 'Unverify user (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User unverified successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async unverifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser);
    return await this.usersService.unverifyUser(id);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Change user role (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: ChangeUserRoleDto })
  @ApiResponse({
    status: 200,
    description: 'User role changed successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changeUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() roleDto: ChangeUserRoleDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser);
    return await this.usersService.changeUserRole(id, roleDto.role);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    this.checkAdminRole(currentUser);
    await this.usersService.remove(id);
    return { message: 'User successfully deleted' };
  }
}
