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
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { LiveMatchResponseDto } from './dto/live-match-response.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchStat } from './entities/match-stat.entity'; // Adjust path if needed
import { MatchService } from './match.service';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @Roles(UserRole.ADMIN as UserRole, UserRole.MODERATOR as UserRole)
  @ApiOperation({ summary: 'Create a new match' })
  @ApiResponse({ status: 201, description: 'Match successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchService.create(createMatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  @ApiResponse({ status: 200, description: 'Return all matches.' })
  findAll() {
    return this.matchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a match by id' })
  @ApiResponse({ status: 200, description: 'Return the match.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN as UserRole, UserRole.MODERATOR as UserRole)
  @ApiOperation({ summary: 'Update a match' })
  @ApiResponse({ status: 200, description: 'Match successfully updated.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchService.update(id, updateMatchDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN as UserRole)
  @ApiOperation({ summary: 'Delete a match' })
  @ApiResponse({ status: 200, description: 'Match successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchService.remove(id);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Get matches by team' })
  @ApiResponse({ status: 200, description: 'Return matches for the team.' })
  findByTeam(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.matchService.findByTeam(teamId);
  }

  @Get('season/:seasonId')
  @ApiOperation({ summary: 'Get matches by season' })
  @ApiResponse({ status: 200, description: 'Return matches for the season.' })
  findBySeason(@Param('seasonId', ParseUUIDPipe) seasonId: string) {
    return this.matchService.findBySeason(seasonId);
  }

  @Post(':id/events')
  @Roles(UserRole.ADMIN as UserRole, UserRole.MODERATOR as UserRole)
  @ApiOperation({ summary: 'Add an event to a match' })
  @ApiResponse({ status: 201, description: 'Event successfully added.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  addEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createMatchEventDto: CreateMatchEventDto,
  ) {
    return this.matchService.addEvent(id, createMatchEventDto);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get events for a match' })
  @ApiResponse({ status: 200, description: 'Return match events.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  getEvents(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchService.getEvents(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get statistics for a match' })
  @ApiResponse({ status: 200, description: 'Return match statistics.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchService.getStats(id);
  }

  @Patch(':id/stats/:side')
  @Roles(UserRole.ADMIN as UserRole, UserRole.MODERATOR as UserRole)
  @ApiOperation({ summary: 'Update statistics for a team in a match' })
  @ApiResponse({ status: 200, description: 'Statistics successfully updated.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  updateStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('side') side: 'home' | 'away',
    @Body() stats: Partial<MatchStat>, // Use correct type instead of any
  ) {
    return this.matchService.updateStats(id, side, stats);
  }

  @Get('live')
  @ApiOperation({ summary: 'Get all live matches' })
  @ApiResponse({
    status: 200,
    description: 'Return all currently live matches.',
    type: [LiveMatchResponseDto],
  })
  getLiveMatches() {
    return this.matchService.getLiveMatches();
  }
}
