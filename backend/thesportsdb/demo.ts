/* import fetch from 'node-fetch';

// Alap URL és API kulcs
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/123';

// Típusdefiníciók
interface Sport {
  idSport: string;
  strSport: string;
  strFormat: string;
}

interface League {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strCountry: string;
}

interface Team {
  idTeam: string;
  strTeam: string;
  strStadium: string;
  strTeamBadge: string;
}

interface Event {
  idEvent: string;
  strEvent: string;
  dateEvent: string;
  strTime: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
}

// 1. Minden sportág lekérése
async function getAllSports(): Promise<Sport[]> {
  const res = await fetch(`${API_BASE}/all_sports.php`);
  const data = await res.json();
  return data.sports;
}

// 2. Minden liga lekérése
async function getAllLeagues(): Promise<League[]> {
  const res = await fetch(`${API_BASE}/all_leagues.php`);
  const data = await res.json();
  return data.leagues;
}

// 3. Csapatok lekérése liga név alapján
async function getTeamsByLeagueName(leagueName: string): Promise<Team[]> {
  const res = await fetch(`${API_BASE}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`);
  const data = await res.json();
  return data.teams;
}

// 4. Következő események lekérése csapat alapján
async function getNextEventsByTeam(teamId: string): Promise<Event[]> {
  const res = await fetch(`${API_BASE}/eventsnext.php?id=${teamId}`);
  const data = await res.json();
  return data.events;
}

// 5. Csapat keresése név alapján
async function searchTeamByName(teamName: string): Promise<Team[]> {
  const res = await fetch(`${API_BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`);
  const data = await res.json();
  return data.teams;
}

// 6. Játékos keresése név alapján
async function searchPlayerByName(playerName: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/searchplayers.php?p=${encodeURIComponent(playerName)}`);
  const data = await res.json();
  return data.player;
}

// Fő függvény a példák futtatásához
async function main() {
  console.log('🔹 Minden sportág:');
  const sports = await getAllSports();
  sports.forEach(sport => {
    console.log(`- ${sport.strSport} (${sport.strFormat})`);
  });

  console.log('\n🔹 Minden liga:');
  const leagues = await getAllLeagues();
  leagues.slice(0, 5).forEach(league => {
    console.log(`- ${league.strLeague} (${league.strSport}) - ${league.strCountry}`);
  });

  console.log('\n🔹 Csapatok az Angol Premier League-ben:');
  const teams = await getTeamsByLeague('4328'); // 4328 = Premier League
  teams.forEach(team => {
    console.log(`- ${team.strTeam} | Stadion: ${team.strStadium}`);
  });

  console.log('\n🔹 Következő események az Arsenal FC számára:');
  const arsenalTeam = teams.find(team => team.strTeam.toLowerCase() === 'arsenal');
  if (arsenalTeam) {
    const events = await getNextEventsByTeam(arsenalTeam.idTeam);
    events.forEach(event => {
      console.log(`- ${event.dateEvent} ${event.strTime}: ${event.strHomeTeam} vs ${event.strAwayTeam}`);
    });
  } else {
    console.log('Arsenal FC nem található a csapatok között.');
  }

  console.log('\n🔹 Csapat keresése név alapján ("Barcelona"):');
  const barcelonaTeams = await searchTeamByName('Barcelona');
  barcelonaTeams.forEach(team => {
    console.log(`- ${team.strTeam} | Stadion: ${team.strStadium}`);
  });

  console.log('\n🔹 Játékos keresése név alapján ("Lionel Messi"):');
  const players = await searchPlayerByName('Lionel Messi');
  players.forEach(player => {
    console.log(`- ${player.strPlayer} | Csapat: ${player.strTeam}`);
  });
}

main().catch(err => console.error('Hiba történt:', err)); */
