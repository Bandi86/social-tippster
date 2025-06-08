/**
 * PostsController - Refactored
 * Frissítve: 2025.06.05
 * Megjegyzés: Minden tipp specifikus endpoint eltávolítva
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { User } from '../users/entities/user.entity';
import { CreatePostDTO } from './dto/create-post.dto';
import { FilterPostsDTO } from './dto/filter-posts.dto';
import { Post as PostEntity } from './entities/posts.entity';
import { PostGuard } from './guards/post.guard';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Új poszt létrehozása' })
  @ApiResponse({ status: 201, description: 'Poszt sikeresen létrehozva' })
  @ApiResponse({ status: 400, description: 'Hibás kérés' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiBody({ type: CreatePostDTO })
  async create(
    @Body() createPostDto: CreatePostDTO,
    @CurrentUser() user: User,
  ): Promise<PostEntity> {
    return this.postsService.create(createPostDto, user.user_id, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'Posztok listázása szűrőkkel' })
  @ApiResponse({ status: 200, description: 'Posztok sikeresen lekérve' })
  async findAll(
    @Query() filterDto: FilterPostsDTO,
    @CurrentUser() user?: User,
  ): Promise<{
    posts: PostEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.postsService.findAll(filterDto, user?.user_id);
  }

  @Get(':id')
  @UseGuards(PostGuard)
  @ApiOperation({ summary: 'Poszt lekérése ID alapján' })
  @ApiResponse({ status: 200, description: 'Poszt sikeresen lekérve' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ): Promise<PostEntity> {
    return this.postsService.findById(id, user?.user_id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PostGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Poszt frissítése' })
  @ApiResponse({ status: 200, description: 'Poszt sikeresen frissítve' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiResponse({ status: 403, description: 'Hozzáférés megtagadva' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  @ApiBody({ type: CreatePostDTO })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<CreatePostDTO>,
    @CurrentUser() user: User,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updateData, user.user_id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PostGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Poszt törlése' })
  @ApiResponse({ status: 204, description: 'Poszt sikeresen törölve' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiResponse({ status: 403, description: 'Hozzáférés megtagadva' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.postsService.delete(id, user.user_id, user.role);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Poszt like/unlike' })
  @ApiResponse({ status: 200, description: 'Like állapot sikeresen módosítva' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  async toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ liked: boolean; likesCount: number }> {
    return this.postsService.toggleLike(id, user.user_id);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Poszt könyvjelzőzése/könyvjelző eltávolítása' })
  @ApiResponse({ status: 200, description: 'Könyvjelző állapot sikeresen módosítva' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  async toggleBookmark(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ bookmarked: boolean }> {
    return this.postsService.toggleBookmark(id, user.user_id);
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Könyvjelző eltávolítása' })
  @ApiResponse({ status: 200, description: 'Könyvjelző sikeresen eltávolítva' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  async removeBookmark(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ bookmarked: boolean }> {
    return this.postsService.removeBookmark(id, user.user_id);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Poszt megosztása' })
  @ApiResponse({ status: 200, description: 'Poszt sikeresen megosztva' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiResponse({ status: 403, description: 'Megosztás nem engedélyezett' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  async sharePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() shareData: { platform: string },
    @CurrentUser() user: User,
  ): Promise<{ shareCount: number }> {
    return this.postsService.sharePost(id, shareData.platform, user.user_id);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Poszt jelentése' })
  @ApiResponse({ status: 200, description: 'Poszt sikeresen jelentve' })
  @ApiResponse({ status: 400, description: 'Már jelentette ezt a posztot' })
  @ApiResponse({ status: 401, description: 'Nincs jogosultság' })
  @ApiResponse({ status: 404, description: 'Poszt nem található' })
  @ApiParam({ name: 'id', description: 'Poszt ID', type: 'string' })
  async reportPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reportData: { reason: string },
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.postsService.reportPost(id, reportData.reason, user.user_id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Felhasználó posztjainak lekérése' })
  @ApiResponse({ status: 200, description: 'Felhasználó posztjai sikeresen lekérve' })
  @ApiParam({ name: 'userId', description: 'Felhasználó ID', type: 'string' })
  async getUserPosts(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() filterDto: FilterPostsDTO,
  ): Promise<{ posts: PostEntity[]; total: number }> {
    return this.postsService.getUserPosts(userId, filterDto);
  }
}
