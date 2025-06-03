import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { ArrayOfIdsDto } from './dto/array-of-ids.dto';
import { BulkSnoozeDto } from './dto/bulk-snooze.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SnoozeNotificationDto, UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Admin ertesitesek a user fele
  @Post()
  @ApiOperation({ summary: 'Create notification (admin only)' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  // Felhasználó osszes ertesitese
  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAll(user.user_id);
  }

  // Paginated fetch for notifications (with snooze filter) - MUST come before :id route
  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async findAllPaginated(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('includeSnoozed') includeSnoozed?: string,
  ) {
    return this.notificationsService.findAllPaginated(
      user.user_id,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
      includeSnoozed === 'true',
    );
  }

  // Konkret id ertesites
  @Get(':id')
  @ApiOperation({ summary: 'Get notification by id' })
  @ApiResponse({ status: 200, description: 'Notification found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only access own notifications' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.findOne(id, user.user_id);
  }

  // frissites
  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own notifications' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.update(id, updateNotificationDto, user.user_id);
  }

  // Egy ertisites  olvasottra allitasa
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own notifications' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user.user_id);
  }

  // Az osszes ertesites olvasottra allitasa
  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.user_id);
  }

  // Ertesites torlese
  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own notifications' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.remove(id, user.user_id);
  }

  // Összes értesítés törlése (csak saját értesítések)
  @Delete('all')
  @ApiOperation({ summary: 'Delete all notifications for current user' })
  @ApiResponse({ status: 200, description: 'All notifications deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  removeAll(@CurrentUser() user: User) {
    return this.notificationsService.removeAll(user.user_id);
  }

  // Bulk mark as read
  @Patch('bulk/mark-read')
  @ApiOperation({ summary: 'Bulk mark notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  async bulkMarkAsRead(@Body() dto: ArrayOfIdsDto, @CurrentUser() user: User) {
    return await this.notificationsService.bulkMarkAsRead(dto.ids, user.user_id);
  }

  // Bulk delete
  @Delete('bulk/delete')
  @ApiOperation({ summary: 'Bulk delete notifications' })
  @ApiResponse({ status: 200, description: 'Notifications deleted' })
  async bulkDelete(@Body() dto: ArrayOfIdsDto, @CurrentUser() user: User) {
    return await this.notificationsService.bulkDelete(dto.ids, user.user_id);
  }

  // Snooze a single notification
  @Patch(':id/snooze')
  @ApiOperation({ summary: 'Snooze a notification until a given time' })
  @ApiResponse({ status: 200, description: 'Notification snoozed' })
  async snoozeNotification(
    @Param('id') id: string,
    @Body() dto: SnoozeNotificationDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.snooze(id, dto.snoozed_until, user.user_id);
  }

  // Bulk snooze notifications
  @Patch('bulk/snooze')
  @ApiOperation({ summary: 'Bulk snooze notifications' })
  @ApiResponse({ status: 200, description: 'Notifications snoozed' })
  async bulkSnooze(@Body() dto: BulkSnoozeDto, @CurrentUser() user: User) {
    return this.notificationsService.bulkSnooze(dto.ids, dto.snoozed_until, user.user_id);
  }
}
