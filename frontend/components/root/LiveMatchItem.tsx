// components/live/LiveMatchItem.tsx (SERVER)
import { Badge } from '@/components/ui/badge';
import {
  formatScore,
  getMatchStatus,
  getSportIcon,
  shortenTeamName,
} from '@/lib/matches-utils';
import { LiveMatch } from '@/lib/matches-utils';

export default function LiveMatchItem({ match }: { match: LiveMatch }) {
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
