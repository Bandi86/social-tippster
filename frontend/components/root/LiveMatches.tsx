'use client';

import CardWrapper from '@/components/shared/CardWrapper';
import { useAuth } from '@/hooks/useAuth';
import { fetchLiveMatches, LiveMatch } from '@/lib/matches-utils';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import LiveMatchItem from './LiveMatchItem';

// Add this type guard above the component
function hasResponseStatus(err: unknown): err is { response: { status: number } } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as { response?: { status?: unknown } }).response === 'object' &&
    (err as { response?: { status?: unknown } }).response !== null &&
    typeof (err as { response: { status?: unknown } }).response.status === 'number'
  );
}

export default function LiveMatches() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const loadLiveMatches = async () => {
      // Ha nincs bejelentkezve, ne próbáljuk meg
      if (!isAuthenticated) {
        setIsLoading(false);
        setError('Bejelentkezés szükséges az élő meccsek megtekintéséhez');
        return;
      }

      try {
        setError(null);
        if (retryCount === 0) setIsLoading(true);

        const data = await fetchLiveMatches(3);

        if (mounted) {
          setMatches(data || []);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (err: unknown) {
        console.error('Error fetching live matches:', err);

        if (mounted) {
          // Use the type guard instead of (err as any)
          const errorMessage = hasResponseStatus(err)
            ? err.response.status === 400
              ? 'Szerver hiba: helytelen kérés formátum'
              : err.response.status === 401
                ? 'Nincs jogosultság - próbálj újra bejelentkezni'
                : err.response.status === 404
                  ? 'Az élő meccsek szolgáltatás jelenleg nem elérhető'
                  : 'Nem sikerült betölteni az élő meccseket'
            : 'Nem sikerült betölteni az élő meccseket';

          setError(errorMessage);

          // Retry logic: max 3 attempts with exponential backoff
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
            setTimeout(() => {
              if (mounted) {
                setRetryCount(prev => prev + 1);
              }
            }, delay);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial load
    loadLiveMatches();

    // Set up interval only if authenticated and no error
    if (isAuthenticated && !error) {
      intervalId = setInterval(() => {
        if (mounted && retryCount === 0) {
          // Only refresh if not in retry mode
          loadLiveMatches();
        }
      }, 30000); // 30 seconds
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, retryCount, error]);

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
      {!error && matches.length > 0 ? (
        <div className='space-y-3'>
          {matches.map(match => (
            <LiveMatchItem key={match.id} match={match} />
          ))}
        </div>
      ) : !error && matches.length === 0 && !isLoading ? (
        <div className='text-sm text-gray-400 text-center py-4'>Jelenleg nincsenek élő meccsek</div>
      ) : error ? (
        <div className='text-sm text-gray-400 text-center py-4'>
          <p className='mb-2'>{error}</p>
          {retryCount > 0 && (
            <p className='text-xs text-gray-500'>Újrapróbálkozás {retryCount}/3...</p>
          )}
        </div>
      ) : null}
    </CardWrapper>
  );
}
