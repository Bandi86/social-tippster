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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService, PaginationQuery } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserStatus, UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created', type: User })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by username' })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by role' })
  async findAll(@Query() query: PaginationQuery) {
    return this.userService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by username or display name' })
  @ApiResponse({ status: 200, description: 'Search results', type: [User] })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<User[]> {
    return this.userService.searchUsers(query, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserStats(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserStats(id);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByUsername(@Param('username') username: string): Promise<User> {
    return this.userService.findByUsername(username);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByEmail(@Param('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User successfully updated', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/last-login')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update user last login timestamp' })
  @ApiResponse({ status: 204, description: 'Last login updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateLastLogin(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.updateLastLogin(id);
  }

  @Patch(':id/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark user email as verified' })
  @ApiResponse({ status: 204, description: 'Email verified successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyEmail(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.updateEmailVerification(id);
  }

  @Patch(':id/followers/increment')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment user followers count' })
  @ApiResponse({ status: 204, description: 'Followers count incremented' })
  async incrementFollowers(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.incrementFollowersCount(id);
  }

  @Patch(':id/followers/decrement')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decrement user followers count' })
  @ApiResponse({ status: 204, description: 'Followers count decremented' })
  async decrementFollowers(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.decrementFollowersCount(id);
  }

  @Patch(':id/following/increment')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment user following count' })
  @ApiResponse({ status: 204, description: 'Following count incremented' })
  async incrementFollowing(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.incrementFollowingCount(id);
  }

  @Patch(':id/following/decrement')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decrement user following count' })
  @ApiResponse({ status: 204, description: 'Following count decremented' })
  async decrementFollowing(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.decrementFollowingCount(id);
  }

  @Patch(':id/tipps/increment')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment user tipps count' })
  @ApiResponse({ status: 204, description: 'Tipps count incremented' })
  async incrementTipps(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.incrementTippsCount(id);
  }

  @Patch(':id/tipps/decrement')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decrement user tipps count' })
  @ApiResponse({ status: 204, description: 'Tipps count decremented' })
  async decrementTipps(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.decrementTippsCount(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
 */

import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
