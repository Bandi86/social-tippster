'use client';

import CardWrapper from '@/components/shared/CardWrapper';
import ListItem from '@/components/shared/ListItem';
import { TrendingTopic, fetchTrendingTopics, getTrendingColor } from '@/lib/trending-utils';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Trending témák komponens
 * A legnépszerűbb hashtag-ek és témák megjelenítése valós adatokkal
 */
export default function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrendingTopics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTrendingTopics(5);
        setTopics(data);
      } catch (err) {
        setError('Nem sikerült betölteni a trending témákat');
        console.error('Error fetching trending topics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingTopics();
  }, []);

  const handleTopicClick = (topic: TrendingTopic) => {
    // TODO: Navigate to topic page or filter posts
    console.log('Clicked topic:', topic.tag);
  };

  return (
    <CardWrapper
      title='Trending témák'
      icon={Flame}
      iconColor='text-orange-500'
      isLoading={isLoading}
      error={error}
      badge={topics.length}
    >
      <div className='space-y-3'>
        {topics.map((topic, index) => (
          <ListItem
            key={topic.id}
            rank={index + 1}
            title={topic.tag}
            badge={topic.tag}
            badgeClassName={getTrendingColor(topic.category)}
            value={topic.posts}
            trend={topic.trend}
            onClick={() => handleTopicClick(topic)}
          />
        ))}
      </div>
    </CardWrapper>
  );
}
