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
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from '../comments/comments.service';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  AdminStatsDto,
  BanUserDto,
  BulkCommentActionDto,
  ChangeUserRoleDto,
  CommentResponseDto,
  FlagCommentDto,
  GetUsersQueryDto,
  ListCommentsQueryDto,
  PaginatedUsersResponseDto,
  UserResponseDto,
} from './dto';

@ApiTags('admin')
@ApiExtraModels(BulkCommentActionDto)
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
  ) {}

  // Admin jogosultság ellenőrzése
  private checkAdminRole(user: User): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin jogosultság szükséges');
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Összes felhasználó lekérése lapozással és szűréssel (csak admin)' })
  @ApiResponse({
    status: 200,
    description: 'Felhasználók sikeresen lekérve',
    type: () => PaginatedUsersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  async getUsers(
    @Query(new ValidationPipe({ transform: true })) queryDto: GetUsersQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<PaginatedUsersResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return this.usersService.findAll(queryDto);
  }

  @Get('users/stats')
  @ApiOperation({ summary: 'Felhasználói statisztikák lekérése (csak admin)' })
  @ApiResponse({
    status: 200,
    description: 'Felhasználói statisztikák sikeresen lekérve',
    type: AdminStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  async getUserStats(@CurrentUser() currentUser: User): Promise<AdminStatsDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return await this.usersService.getAdminStats();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Felhasználó lekérése ID alapján (csak admin)' })
  @ApiParam({ name: 'id', description: 'Felhasználó UUID' })
  @ApiResponse({ status: 200, description: 'Felhasználó megtalálva', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  @ApiResponse({ status: 404, description: 'Felhasználó nem található' })
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return this.usersService.findOne(id);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Felhasználó kitiltása (csak admin)' })
  @ApiParam({ name: 'id', description: 'Felhasználó UUID' })
  @ApiBody({ type: BanUserDto })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó sikeresen kitiltva',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  @ApiResponse({ status: 404, description: 'Felhasználó nem található' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() banDto: BanUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return this.usersService.banUser(id, banDto.reason);
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Felhasználó kitiltásának feloldása (csak admin)' })
  @ApiParam({ name: 'id', description: 'Felhasználó UUID' })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó kitiltása sikeresen feloldva',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  @ApiResponse({ status: 404, description: 'Felhasználó nem található' })
  async unbanUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return this.usersService.unbanUser(id);
  }

  @Post('users/:id/verify')
  @ApiOperation({ summary: 'Felhasználó hitelesítése (csak admin)' })
  @ApiParam({ name: 'id', description: 'Felhasználó UUID' })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó sikeresen hitelesítve',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  @ApiResponse({ status: 404, description: 'Felhasználó nem található' })
  async verifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return this.usersService.verifyUser(id);
  }

  @Post('users/:id/unverify')
  @ApiOperation({ summary: 'Felhasználó hitelesítésének visszavonása (csak admin)' })
  @ApiParam({ name: 'id', description: 'Felhasználó UUID' })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó hitelesítése sikeresen visszavonva',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  @ApiResponse({ status: 404, description: 'Felhasználó nem található' })
  async unverifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return await this.usersService.unverifyUser(id);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Felhasználó szerepkörének módosítása (csak admin)' })
  @ApiParam({ name: 'id', description: 'Felhasználó UUID' })
  @ApiBody({ type: ChangeUserRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó szerepköre sikeresen módosítva',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  @ApiResponse({ status: 404, description: 'Felhasználó nem található' })
  async changeUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() roleDto: ChangeUserRoleDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése

    // Szerepkör validálása
    if (!Object.values(UserRole).includes(roleDto.role)) {
      throw new ForbiddenException('Érvénytelen szerepkör');
    }
    return await this.usersService.changeUserRole(id, roleDto.role);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Felhasználó törlése (csak admin)' })
  @ApiParam({ name: 'id', description: 'Felhasználó UUID' })
  @ApiResponse({ status: 200, description: 'Felhasználó sikeresen törölve' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  @ApiResponse({ status: 404, description: 'Felhasználó nem található' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    await this.usersService.remove(id);
    return { message: 'Felhasználó sikeresen törölve' };
  }

  // Admin Kommentek Kezelése
  @Get('comments')
  @ApiOperation({ summary: 'Összes komment lekérése admin szűréssel (csak admin)' })
  @ApiQuery({ name: 'page', required: false, description: 'Oldal szám (alapértelmezett: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elemek oldalanként (alapértelmezett: 20)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Keresés a komment tartalmában' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Szűrés státusz szerint (all, flagged, reported, active)',
  })
  @ApiQuery({ name: 'postId', required: false, description: 'Szűrés bejegyzés ID szerint' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Szűrés szerző ID szerint' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Rendezési mező (newest, oldest, most_reported)',
  })
  @ApiResponse({
    status: 200,
    description: 'Kommentek sikeresen lekérve',
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'array', items: { $ref: getSchemaPath(CommentResponseDto) } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság - JWT token szükséges' })
  @ApiResponse({ status: 403, description: 'Tiltott - Admin jogosultság szükséges' })
  async getAdminComments(
    @Query(new ValidationPipe({ transform: true })) query: ListCommentsQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<{
    comments: CommentResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return this.commentsService.findAllForAdmin(query);
  }

  @Get('comments/stats')
  @ApiOperation({ summary: 'Komment statisztikák lekérése (csak admin)' })
  @ApiResponse({ status: 200, description: 'Komment statisztikák', type: AdminStatsDto })
  async getCommentsStats(@CurrentUser() currentUser: User): Promise<AdminStatsDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    // Teljes AdminStatsDto összeállítása az összes kötelező mezővel, hiányzókat 0-val kitöltve
    const stats = await this.commentsService.getAdminStats();
    return {
      total: stats.total,
      active: stats.active,
      banned: 0, // Nem elérhető a commentsService-ből
      unverified: 0, // Nem elérhető a commentsService-ből
      admins: 0, // Nem elérhető a commentsService-ből
      recentRegistrations: 0, // Nem elérhető a commentsService-ből
    };
  }

  @Post('comments/:id/flag')
  @ApiOperation({ summary: 'Komment megjelölése (csak admin)' })
  @ApiParam({ name: 'id', description: 'Komment UUID' })
  @ApiBody({ type: FlagCommentDto })
  @ApiResponse({ status: 200, description: 'Komment megjelölve', type: CommentResponseDto })
  async flagComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    flagData: FlagCommentDto,
    @CurrentUser() currentUser: User,
  ): Promise<CommentResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    // DTO megfelelően validálva van, biztonságosan használhatjuk
    return this.commentsService.flag(id, flagData.reason, currentUser);
  }

  @Post('comments/:id/unflag')
  @ApiOperation({ summary: 'Komment megjelölésének eltávolítása (csak admin)' })
  @ApiParam({ name: 'id', description: 'Komment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Komment megjelölése eltávolítva',
    type: CommentResponseDto,
  })
  async unflagComment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<CommentResponseDto> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    return this.commentsService.unflag(id, currentUser);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Komment törlése (csak admin)' })
  @ApiParam({ name: 'id', description: 'Komment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Komment törölve',
    schema: { example: { message: 'Komment sikeresen törölve' } },
  })
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    await this.commentsService.remove(id, currentUser);
    return { message: 'Komment sikeresen törölve' };
  }

  @Post('comments/bulk-action')
  @ApiOperation({ summary: 'Tömeges művelet végrehajtása kommenteken (csak admin)' })
  @ApiBody({ type: BulkCommentActionDto })
  @ApiResponse({
    status: 200,
    description: 'Tömeges művelet eredménye',
    schema: { example: { message: 'Tömeges művelet befejezve', processed: 5 } },
  })
  async bulkCommentAction(
    @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    bulkData: BulkCommentActionDto,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string; processed: number }> {
    this.checkAdminRole(currentUser); // Admin jogosultság ellenőrzése
    // DTO megfelelően validálva van, biztonságosan használhatjuk
    return this.commentsService.bulkAction(
      bulkData.commentIds,
      bulkData.action,
      currentUser,
      bulkData.reason,
    );
  }
}
