import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface FeedPostProps {
  author: string;
  timeAgo: string;
  content: string;
  tipType: 'match' | 'over-under' | 'handicap';
  confidence: number;
  likes: number;
  comments: number;
  shares: number;
}

const tipTypeIcons = {
  match: '⚽',
  'over-under': '📊',
  handicap: '⚖️',
};

export default function FeedPost({
  author,
  timeAgo,
  content,
  tipType,
  confidence,
  likes,
  comments,
  shares,
}: FeedPostProps) {
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'match':
        return 'default';
      case 'over-under':
        return 'secondary';
      case 'handicap':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card className='hover-lift transition-smooth'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <Avatar>
              <AvatarFallback className='bg-gradient-to-r from-primary to-secondary text-white'>
                {author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className='font-semibold text-sm'>{author}</h4>
              <p className='text-xs text-muted-foreground'>{timeAgo}</p>
            </div>
          </div>
          <Badge variant={getBadgeVariant(tipType)}>
            {tipTypeIcons[tipType]} {tipType.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Post Content */}
        <p className='text-sm leading-relaxed'>{content}</p>

        {/* Confidence Bar */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs font-medium text-muted-foreground'>Confidence Level</span>
            <Badge variant='confidence'>{confidence}%</Badge>
          </div>
          <div className='w-full bg-muted rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300'
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Post Actions */}
        <div className='flex items-center justify-between pt-3 border-t'>
          <Button variant='ghost' size='sm' className='text-muted-foreground hover:text-foreground'>
            <Heart className='h-4 w-4 mr-1' />
            {likes}
          </Button>
          <Button variant='ghost' size='sm' className='text-muted-foreground hover:text-foreground'>
            <MessageCircle className='h-4 w-4 mr-1' />
            {comments}
          </Button>
          <Button variant='ghost' size='sm' className='text-muted-foreground hover:text-foreground'>
            <Share2 className='h-4 w-4 mr-1' />
            {shares}
          </Button>
          <Button variant='sport' size='sm'>
            Follow Tip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Feed Component
export function MainFeed() {
  const samplePosts: FeedPostProps[] = [
    {
      author: 'Sports Expert Mike',
      timeAgo: '2 hours ago',
      content:
        "Manchester United vs Arsenal - I'm backing United to win at home. They've been solid defensively and Arsenal struggles away from home. Value bet at 2.10 odds.",
      tipType: 'match',
      confidence: 85,
      likes: 42,
      comments: 8,
      shares: 5,
    },
    {
      author: 'Pro Tipster Sarah',
      timeAgo: '4 hours ago',
      content:
        'Barcelona vs PSG - Over 2.5 goals looks great here. Both teams have explosive attacking power and questionable defense. Expecting a high-scoring thriller.',
      tipType: 'over-under',
      confidence: 72,
      likes: 67,
      comments: 15,
      shares: 12,
    },
    {
      author: 'Football Analytics',
      timeAgo: '6 hours ago',
      content:
        'Real Madrid -1 handicap vs Atletico Madrid. Real has dominated recent head-to-head meetings and their home form is exceptional. Worth backing with confidence.',
      tipType: 'handicap',
      confidence: 91,
      likes: 123,
      comments: 24,
      shares: 18,
    },
  ];

  return (
    <div className='space-y-4'>
      {/* Create Post Card */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center space-x-3 mb-4'>
            <Avatar>
              <AvatarFallback className='bg-gradient-to-r from-accent to-primary text-white'>
                Y
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <textarea
                placeholder='Share your sports tip or prediction...'
                className='w-full resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none'
                rows={3}
              />
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex space-x-2'>
              <Badge variant='outline' className='cursor-pointer hover:bg-muted'>
                ⚽ Match
              </Badge>
              <Badge variant='outline' className='cursor-pointer hover:bg-muted'>
                📊 Over/Under
              </Badge>
              <Badge variant='outline' className='cursor-pointer hover:bg-muted'>
                ⚖️ Handicap
              </Badge>
            </div>
            <Button variant='sport'>Share Tip</Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      {samplePosts.map((post, index) => (
        <FeedPost key={index} {...post} />
      ))}

      {/* Load More */}
      <div className='flex justify-center pt-6'>
        <Button variant='outline'>Load More Tips</Button>
      </div>
    </div>
  );
}
