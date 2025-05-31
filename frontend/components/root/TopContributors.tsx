'use client';

import CardWrapper from '@/components/shared/CardWrapper';
import UserListItem from '@/components/shared/UserListItem';
import { TopContributor, fetchTopContributors, getRankColor } from '@/lib/community-utils';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Top hozzászólók komponens
 * A legjobb teljesítménnyel rendelkező felhasználók listája valós adatokkal
 */
export default function TopContributors() {
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopContributors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTopContributors(5);
        setContributors(data);
      } catch (err) {
        setError('Nem sikerült betölteni a top hozzászólókat');
        console.error('Error fetching top contributors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopContributors();
  }, []);

  const handleUserClick = (contributor: TopContributor) => {
    // TODO: Navigate to user profile
    console.log('Clicked user:', contributor.username);
  };

  return (
    <CardWrapper
      title='Top hozzászólók'
      icon={Trophy}
      iconColor='text-yellow-500'
      isLoading={isLoading}
      error={error}
      badge={contributors.length}
    >
      <div className='space-y-3'>
        {contributors.map(contributor => (
          <UserListItem
            key={contributor.id}
            rank={contributor.rank}
            username={contributor.username}
            avatar={contributor.avatar}
            points={contributor.points}
            badge={contributor.badge}
            subtitle={`${contributor.accuracy_rate}% pontosság`}
            rankColor={getRankColor(contributor.rank)}
            onClick={() => handleUserClick(contributor)}
          />
        ))}
      </div>
    </CardWrapper>
  );
}
