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
      if (foundSeason) {
        season = foundSeason;
      } else {
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

  async getLiveMatches(limit?: number): Promise<LiveMatchResponseDto[]> {
    try {
      console.log('getLiveMatches service called with limit:', limit);

      // Build query with proper typing
      let queryBuilder = this.matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.homeTeam', 'homeTeam')
        .leftJoinAndSelect('match.awayTeam', 'awayTeam')
        .leftJoinAndSelect('match.season', 'season')
        .leftJoinAndSelect('season.league', 'league')
        .leftJoinAndSelect('match.events', 'events')
        .leftJoinAndSelect('match.stats', 'stats')
        .where('match.status = :status', { status: MatchStatus.LIVE })
        .orderBy('match.date', 'ASC');

      // Apply limit if provided and valid
      if (limit && limit > 0) {
        queryBuilder = queryBuilder.limit(limit);
      }

      const liveMatches: Match[] = await queryBuilder.getMany();

      console.log(`Found ${liveMatches.length} live matches`);

      return liveMatches.map((match: Match): LiveMatchResponseDto => {
        // Safely access team names with null checks
        const homeTeamName = match.homeTeam?.name ?? 'Unknown Home Team';
        const awayTeamName = match.awayTeam?.name ?? 'Unknown Away Team';

        // Use the existing score fields from the match entity with null checks
        const homeScore = match.homeScore ?? 0;
        const awayScore = match.awayScore ?? 0;

        // Determine current time based on match minute or latest event
        let currentTime = '';
        if (match.status === MatchStatus.LIVE) {
          if (typeof match.minute === 'number') {
            currentTime = `${match.minute}'`;
          } else if (match.events && Array.isArray(match.events) && match.events.length > 0) {
            // Filter and sort events safely
            const validEvents = match.events.filter(
              (event): event is MatchEvent =>
                event !== null && event !== undefined && typeof event.minute === 'number',
            );

            if (validEvents.length > 0) {
              const sortedEvents = validEvents.sort((a, b) => b.minute - a.minute);
              const latestEvent = sortedEvents[0];
              currentTime = `${latestEvent.minute}'`;
            } else {
              currentTime = "0'";
            }
          } else {
            currentTime = "0'";
          }
        }

        // Safely access sport type with null checks
        let sport = 'football';
        if (match.season?.league?.sport_type) {
          sport = String(match.season.league.sport_type);
        }

        // Safely access league name with null check
        const leagueName = match.season?.league?.name ?? 'Unknown League';

        // Safely access date with null check
        const startTime =
          match.date instanceof Date ? match.date.toISOString() : new Date().toISOString();

        return {
          id: match.id,
          home_team: homeTeamName,
          away_team: awayTeamName,
          home_score: homeScore,
          away_score: awayScore,
          status: match.status,
          current_time: currentTime,
          league: leagueName,
          sport,
          start_time: startTime,
          venue: match.venue ?? null,
        };
      });
    } catch (error) {
      console.error('Error in getLiveMatches service:', error);
      throw error;
    }
  }
}
