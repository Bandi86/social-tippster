// Seed script for football data (teams, leagues, matches)
// Usage: npx ts-node backend/src/database/seed-football-data.ts

import * as dotenv from 'dotenv';
dotenv.config();

import { League, SportType } from '../modules/data/league/entities/league.entity';
import { Match, MatchStatus } from '../modules/data/match/entities/match.entity';
import { Season } from '../modules/data/season/entities/season.entity';
import { Team } from '../modules/data/team/entities/team.entity';
import dataSource from './data-source';

async function seedFootballData() {
  try {
    await dataSource.initialize();
    console.log('🔌 Database connected');

    // Create leagues
    const leagueRepo = dataSource.getRepository(League);
    const premierLeague = await leagueRepo.save({
      name: 'Premier League',
      country: 'England',
      logoUrl: 'https://example.com/premier-league-logo.png',
      sport_type: SportType.FOOTBALL,
    });

    const laLiga = await leagueRepo.save({
      name: 'La Liga',
      country: 'Spain',
      logoUrl: 'https://example.com/la-liga-logo.png',
      sport_type: SportType.FOOTBALL,
    });

    console.log('✅ Created leagues');

    // Create seasons
    const seasonRepo = dataSource.getRepository(Season);
    const currentSeason = await seasonRepo.save({
      yearStart: 2024,
      yearEnd: 2025,
      name: '2024/25',
      isActive: true,
      startDate: new Date('2024-08-17'),
      endDate: new Date('2025-05-25'),
      league: premierLeague,
    });

    const laLigaSeason = await seasonRepo.save({
      yearStart: 2024,
      yearEnd: 2025,
      name: '2024/25',
      isActive: true,
      startDate: new Date('2024-08-18'),
      endDate: new Date('2025-05-25'),
      league: laLiga,
    });

    console.log('✅ Created seasons');

    // Create teams
    const teamRepo = dataSource.getRepository(Team);
    const teams = await teamRepo.save([
      {
        name: 'Manchester United',
        shortName: 'MUN',
        logo: 'https://example.com/man-utd-logo.png',
        founded: 1878,
        venue: 'Old Trafford',
        venueCapacity: 74994,
        league: premierLeague,
      },
      {
        name: 'Liverpool FC',
        shortName: 'LIV',
        logo: 'https://example.com/liverpool-logo.png',
        founded: 1892,
        venue: 'Anfield',
        venueCapacity: 54074,
        league: premierLeague,
      },
      {
        name: 'Chelsea FC',
        shortName: 'CHE',
        logo: 'https://example.com/chelsea-logo.png',
        founded: 1905,
        venue: 'Stamford Bridge',
        venueCapacity: 40834,
        league: premierLeague,
      },
      {
        name: 'Real Madrid',
        shortName: 'RMA',
        logo: 'https://example.com/real-madrid-logo.png',
        founded: 1902,
        venue: 'Santiago Bernabéu',
        venueCapacity: 81044,
        league: laLiga,
      },
      {
        name: 'FC Barcelona',
        shortName: 'BAR',
        logo: 'https://example.com/barcelona-logo.png',
        founded: 1899,
        venue: 'Camp Nou',
        venueCapacity: 99354,
        league: laLiga,
      },
    ]);

    console.log(`✅ Created ${teams.length} teams`);

    // Create matches
    const matchRepo = dataSource.getRepository(Match);
    const now = new Date();

    // Create some live matches for testing
    const liveMatches = await matchRepo.save([
      {
        homeTeamId: teams[0].id, // Manchester United
        awayTeamId: teams[1].id, // Liverpool
        homeScore: 2,
        awayScore: 1,
        date: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
        status: MatchStatus.LIVE,
        minute: 67,
        season: currentSeason,
        venue: 'Old Trafford',
        referee: 'Michael Oliver',
      },
      {
        homeTeamId: teams[2].id, // Chelsea
        awayTeamId: teams[0].id, // Manchester United
        homeScore: 1,
        awayScore: 1,
        date: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
        status: MatchStatus.LIVE,
        minute: 82,
        season: currentSeason,
        venue: 'Stamford Bridge',
        referee: 'Anthony Taylor',
      },
      {
        homeTeamId: teams[3].id, // Real Madrid
        awayTeamId: teams[4].id, // Barcelona
        homeScore: 0,
        awayScore: 0,
        date: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: MatchStatus.SCHEDULED,
        season: laLigaSeason,
        venue: 'Santiago Bernabéu',
        referee: 'Jesús Gil Manzano',
      },
    ]);

    console.log(`✅ Created ${liveMatches.length} matches (including live matches)`);

    console.log('🎉 Football data seeded successfully!');
  } catch (error) {
    console.error('❌ Football seed error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seedFootballData().catch(err => {
  console.error('❌ Football seed failed:', err);
  process.exit(1);
});
