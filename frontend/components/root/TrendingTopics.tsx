'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

/**
 * Trending témák komponens
 * A legnépszerűbb hashtag-ek és témák megjelenítése
 */
export default function TrendingTopics() {
  const trendingTopics = [
    { tag: '#premier-league', posts: 234, trend: '+12%' },
    { tag: '#NBA', posts: 189, trend: '+8%' },
    { tag: '#tenisz', posts: 156, trend: '+5%' },
    { tag: '#formula1', posts: 123, trend: '+15%' },
    { tag: '#labdarugas', posts: 98, trend: '+3%' },
  ];

  return (
    <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg text-white flex items-center gap-2'>
          <Flame className='h-5 w-5 text-orange-500' />
          Trending témák
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-3'>
          {trendingTopics.map((topic, index) => (
            <div key={topic.tag} className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold text-gray-500'>#{index + 1}</span>
                <Badge
                  variant='secondary'
                  className='bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                >
                  {topic.tag}
                </Badge>
              </div>
              <div className='text-right'>
                <div className='text-sm text-amber-400 font-semibold'>{topic.posts}</div>
                <div className='text-xs text-green-400'>{topic.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
