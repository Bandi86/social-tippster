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
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto,
  })
  async findAll(@Query() queryDto: GetUsersQueryDto): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(queryDto);
  }

  // IMPORTANT: /me endpoint must be before /:id to avoid routing conflicts
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async getCurrentUser(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.usersService.findOne(user.user_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiParam({ name: 'username', description: 'Username' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByUsername(@Param('username') username: string): Promise<UserResponseDto> {
    return this.usersService.findByUsername(username);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile (own profile only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own profile',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    // Authorization: User can only update their own profile
    if (currentUser.user_id !== id) {
      throw new ForbiddenException('Csak a saját profilod frissítheted');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password (own password only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only change own password',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // Authorization: User can only change their own password
    if (currentUser.user_id !== id) {
      throw new ForbiddenException('Csak a saját jelszavadat változtathatod meg');
    }
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user account (own account only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own account',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // Authorization: User can only delete their own account
    if (currentUser.user_id !== id) {
      throw new ForbiddenException('Csak a saját fiókodat törölheted');
    }
    return this.usersService.remove(id);
  }

  @Patch(':id/ban')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ban user (admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'User banned successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin rights required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
    @Body('reason') reason?: string,
  ): Promise<UserResponseDto> {
    // Admin role check - only admins can ban users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin jogosultság szükséges a felhasználó kitiltásához');
    }
    return this.usersService.banUser(id, reason);
  }

  @Patch(':id/unban')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
    // Admin role check - only admins can unban users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin jogosultság szükséges a tiltás feloldásához');
    }
    return this.usersService.unbanUser(id);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
    // Admin role check - only admins can verify users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin jogosultság szükséges a felhasználó verifikálásához');
    }
    return this.usersService.verifyUser(id);
  }

  @Patch(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Follow user' })
  @ApiParam({ name: 'id', description: 'User UUID to follow' })
  @ApiResponse({ status: 204, description: 'User followed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async followUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // Prevent self-following
    if (currentUser.user_id === id) {
      throw new ForbiddenException('Nem követheted önmagadat');
    }
    await this.usersService.incrementFollowerCount(id);
  }

  @Patch(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unfollow user' })
  @ApiParam({ name: 'id', description: 'User UUID to unfollow' })
  @ApiResponse({ status: 204, description: 'User unfollowed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollowUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // Prevent self-unfollowing
    if (currentUser.user_id === id) {
      throw new ForbiddenException('Nem szüntetheted meg önmagad követését');
    }
    await this.usersService.decrementFollowerCount(id);
  }
}
