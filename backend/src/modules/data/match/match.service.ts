import { Injectable, NotFoundException } from '@nestjs/common';
import { Season } from '../season/entities/season.entity';
import { SeasonRepository } from '../season/repositories/season.repository';
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { LiveMatchResponseDto } from './dto/live-match-response.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Match, MatchEvent, MatchStat, MatchStatus } from './entities';
import { MatchEventRepository } from './repositories/match-event.repository';
import { MatchStatRepository } from './repositories/match-stat.repository';
import { MatchRepository } from './repositories/match.repository';

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly matchEventRepository: MatchEventRepository,
    private readonly matchStatRepository: MatchStatRepository,
    private readonly seasonRepository: SeasonRepository,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    let season: Season | undefined = undefined;
    if (createMatchDto.seasonId) {
      const foundSeason = await this.seasonRepository.findOne({
        where: { id: createMatchDto.seasonId },
      });
      season = foundSeason === null ? undefined : foundSeason;
      if (!season) {
        throw new NotFoundException(`Season with ID ${createMatchDto.seasonId} not found`);
      }
    }
    const matchObj: Partial<Match> = {
      homeTeamId: createMatchDto.homeTeamId,
      awayTeamId: createMatchDto.awayTeamId,
      date: createMatchDto.date ? new Date(createMatchDto.date) : undefined,
      status: createMatchDto.status,
      season, // assign the full Season entity or undefined
      venue: createMatchDto.venue,
      referee: createMatchDto.referee,
      attendance: createMatchDto.attendance,
      weather: createMatchDto.weather,
    };
    const match = this.matchRepository.create(matchObj);
    return await this.matchRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return await this.matchRepository.find({
      relations: ['homeTeam', 'awayTeam', 'season', 'events', 'stats'],
    });
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['homeTeam', 'awayTeam', 'season', 'events', 'stats'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);
    Object.assign(match, updateMatchDto);
    return await this.matchRepository.save(match);
  }

  async remove(id: string): Promise<void> {
    const match = await this.findOne(id);
    await this.matchRepository.remove(match);
  }

  async findByTeam(teamId: string): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [{ homeTeam: { id: teamId } }, { awayTeam: { id: teamId } }],
      relations: ['homeTeam', 'awayTeam', 'season', 'events', 'stats'],
    });
  }

  async findBySeason(seasonId: string): Promise<Match[]> {
    return await this.matchRepository.find({
      where: { season: { id: seasonId } },
      relations: ['homeTeam', 'awayTeam', 'season', 'events', 'stats'],
    });
  }

  async addEvent(matchId: string, createMatchEventDto: CreateMatchEventDto): Promise<MatchEvent> {
    const match = await this.findOne(matchId);
    const event = this.matchEventRepository.create({
      ...createMatchEventDto,
      match,
    });
    return this.matchEventRepository.save(event);
  }

  async getEvents(matchId: string): Promise<MatchEvent[]> {
    await this.findOne(matchId);
    return await this.matchEventRepository.find({
      where: { match: { id: matchId } },
      relations: ['player', 'team'],
      order: { minute: 'ASC' },
    });
  }

  async getStats(matchId: string): Promise<MatchStat[]> {
    await this.findOne(matchId);
    return await this.matchStatRepository.find({
      where: { match: { id: matchId } },
      relations: ['team'],
    });
  }

  async updateStats(
    matchId: string,
    teamType: 'home' | 'away',
    stats: Partial<MatchStat>,
  ): Promise<MatchStat> {
    let matchStat = await this.matchStatRepository.findOne({
      where: { match: { id: matchId }, teamType },
    });

    if (!matchStat) {
      const match = await this.findOne(matchId);
      matchStat = this.matchStatRepository.create({
        match,
        teamType,
        ...stats,
      });
    } else {
      Object.assign(matchStat, stats);
    }

    if (!matchStat) throw new Error('Failed to create or find MatchStat');
    return this.matchStatRepository.save(matchStat);
  }

  async getLiveMatches(): Promise<LiveMatchResponseDto[]> {
    const liveMatches = await this.matchRepository.find({
      where: { status: MatchStatus.LIVE },
      relations: ['homeTeam', 'awayTeam', 'season', 'season.league', 'events', 'stats'],
    });

    return liveMatches.map(match => {
      // Use the existing score fields from the match entity
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;

      // Determine current time based on match minute or latest event
      let currentTime = '';
      if (match.status === MatchStatus.LIVE) {
        if (match.minute) {
          currentTime = `${match.minute}'`;
        } else {
          const latestEvent = match.events?.sort((a, b) => b.minute - a.minute)[0];
          currentTime = latestEvent ? `${latestEvent.minute}'` : "0'";
        }
      }

      return {
        id: match.id,
        home_team: match.homeTeam.name,
        away_team: match.awayTeam.name,
        home_score: homeScore,
        away_score: awayScore,
        status: match.status,
        current_time: currentTime,
        league: match.season?.league?.name || 'Unknown League',
        sport: 'football', // Default to football for now
        start_time: match.date.toISOString(),
        venue: match.venue,
      };
    });
  }
}
