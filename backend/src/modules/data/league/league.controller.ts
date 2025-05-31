import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { LeagueService } from './league.service';

@ApiTags('leagues')
@Controller('leagues')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @Post()
  @Roles(UserRole.ADMIN as UserRole, UserRole.MODERATOR as UserRole)
  @ApiOperation({ summary: 'Create a new league' })
  @ApiResponse({ status: 201, description: 'League successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createLeagueDto: CreateLeagueDto) {
    return this.leagueService.create(createLeagueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leagues' })
  @ApiResponse({ status: 200, description: 'Return all leagues.' })
  findAll() {
    return this.leagueService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a league by id' })
  @ApiResponse({ status: 200, description: 'Return the league.' })
  @ApiResponse({ status: 404, description: 'League not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leagueService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN as UserRole, UserRole.MODERATOR as UserRole)
  @ApiOperation({ summary: 'Update a league' })
  @ApiResponse({ status: 200, description: 'League successfully updated.' })
  @ApiResponse({ status: 404, description: 'League not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateLeagueDto: UpdateLeagueDto) {
    return this.leagueService.update(id, updateLeagueDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN as UserRole)
  @ApiOperation({ summary: 'Delete a league' })
  @ApiResponse({ status: 200, description: 'League successfully deleted.' })
  @ApiResponse({ status: 404, description: 'League not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leagueService.remove(id);
  }
}
