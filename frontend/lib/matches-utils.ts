/**
 * Élő meccsekhez kapcsolódó segédfüggvények és típusok
 * Live matches related utility functions and types
 */

// Types
export interface LiveMatch {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: 'live' | 'halftime' | 'finished' | 'scheduled';
  current_time: string;
  league: string;
  sport: 'football' | 'basketball' | 'tennis' | 'baseball';
  start_time: string;
}

export interface MatchStatus {
  is_live: boolean;
  display_text: string;
  color_class: string;
}

// Match státusz formázás
export const getMatchStatus = (match: LiveMatch): MatchStatus => {
  switch (match.status) {
    case 'live':
      return {
        is_live: true,
        display_text: 'LIVE',
        color_class: 'bg-red-600 text-white',
      };
    case 'halftime':
      return {
        is_live: false,
        display_text: 'SZÜNET',
        color_class: 'bg-orange-600 text-white',
      };
    case 'finished':
      return {
        is_live: false,
        display_text: 'VÉGE',
        color_class: 'bg-gray-600 text-white',
      };
    case 'scheduled':
      return {
        is_live: false,
        display_text: 'HAMAROSAN',
        color_class: 'bg-blue-600 text-white',
      };
    default:
      return {
        is_live: false,
        display_text: 'ISMERETLEN',
        color_class: 'bg-gray-600 text-white',
      };
  }
};

// Eredmény formázás
export const formatScore = (homeScore: number, awayScore: number): string => {
  return `${homeScore} - ${awayScore}`;
};

// Csapat név rövidítés
export const shortenTeamName = (name: string, maxLength: number = 15): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};

// Sport ikon meghatározás
export const getSportIcon = (sport: LiveMatch['sport']): string => {
  const icons = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    baseball: '⚾',
  };
  return icons[sport] || '⚽';
};

// Mock data helper (to be replaced with real API calls)
export const getMockLiveMatches = (): LiveMatch[] => [
  {
    id: '1',
    home_team: 'Manchester United',
    away_team: 'Liverpool',
    home_score: 2,
    away_score: 1,
    status: 'live',
    current_time: "67'",
    league: 'Premier League',
    sport: 'football',
    start_time: new Date().toISOString(),
  },
  {
    id: '2',
    home_team: 'Lakers',
    away_team: 'Warriors',
    home_score: 89,
    away_score: 92,
    status: 'live',
    current_time: 'Q3 8:45',
    league: 'NBA',
    sport: 'basketball',
    start_time: new Date().toISOString(),
  },
  {
    id: '3',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    home_score: 0,
    away_score: 0,
    status: 'scheduled',
    current_time: '',
    league: 'La Liga',
    sport: 'football',
    start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  },
];

// API hívások (real implementation)
export const fetchLiveMatches = async (limit: number = 5): Promise<LiveMatch[]> => {
  try {
    // Dynamic import to ensure client-side execution
    const { apiClient } = await import('./api-client');

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('fetchLiveMatches can only be called on client side');
    }

    const response = await apiClient.get<LiveMatch[]>('/matches/live', {
      timeout: 10000, // 10 second timeout
      params: limit ? { limit } : undefined,
    });

    console.log('Live matches response:', response.data);

    // Validate response data
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: expected array');
    }

    return response.data.slice(0, limit);
  } catch (error: any) {
    console.error('Error fetching live matches from API:', error);

    // In development, provide more detailed error info
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
      });
    }

    // Don't fallback to mock data, let the component handle the error
    throw error;
  }
};

export const fetchMatchById = async (matchId: string): Promise<LiveMatch | null> => {
  try {
    const { apiClient } = await import('./api-client');
    const response = await apiClient.get<LiveMatch>(`/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching match by ID from API:', error);
    // Fallback to mock data
    const matches = getMockLiveMatches();
    return matches.find(match => match.id === matchId) || null;
  }
};
