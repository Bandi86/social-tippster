'use client';

import CardWrapper from '@/components/shared/CardWrapper';
import { Badge } from '@/components/ui/badge';
import {
  LiveMatch,
  fetchLiveMatches,
  formatScore,
  getMatchStatus,
  getSportIcon,
  shortenTeamName,
} from '@/lib/matches-utils';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Élő meccs komponens
 * Individual live match display component
 */
function LiveMatchItem({ match }: { match: LiveMatch }) {
  const status = getMatchStatus(match);

  return (
    <div className='p-3 bg-gray-800/50 rounded-lg border border-gray-700'>
      <div className='flex justify-between items-center mb-2'>
        <span className='text-sm font-semibold text-white flex items-center gap-2'>
          <span>{getSportIcon(match.sport)}</span>
          <span className='truncate'>
            {shortenTeamName(match.home_team)} vs {shortenTeamName(match.away_team)}
          </span>
        </span>
        <Badge className={status.color_class}>{status.display_text}</Badge>
      </div>

      <div className='text-center'>
        <span className='text-2xl font-bold text-amber-400'>
          {formatScore(match.home_score, match.away_score)}
        </span>
      </div>

      <div className='text-xs text-gray-400 text-center mt-2'>
        {match.current_time && `${match.current_time} - `}
        {match.league}
      </div>
    </div>
  );
}

/**
 * Élő meccsek komponens
 * Valós idejű sportesemények eredményeinek megjelenítése
 */
export default function LiveMatches() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLiveMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchLiveMatches(3);
        setMatches(data);
      } catch (err) {
        setError('Nem sikerült betölteni az élő meccseket');
        console.error('Error fetching live matches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveMatches();

    // Refresh live matches every 30 seconds
    const interval = setInterval(loadLiveMatches, 30000);

    return () => clearInterval(interval);
  }, []);

  const liveMatchesCount = matches.filter(m => m.status === 'live').length;

  return (
    <CardWrapper
      title='Élő meccsek'
      icon={Activity}
      iconColor='text-red-500'
      isLoading={isLoading}
      error={error}
      liveIndicator={liveMatchesCount > 0}
      badge={matches.length}
    >
      <div className='space-y-3'>
        {matches.map(match => (
          <LiveMatchItem key={match.id} match={match} />
        ))}
      </div>
    </CardWrapper>
  );
}
