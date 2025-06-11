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

const tipTypeColors = {
  match: 'border-blue-500 bg-blue-50',
  'over-under': 'border-green-500 bg-green-50',
  handicap: 'border-orange-500 bg-orange-50',
};

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
  return (
    <article className='bg-white rounded-lg border p-4 shadow-sm mb-4 hover-lift'>
      {/* Post Header */}
      <div className='flex items-center space-x-3 mb-4'>
        <div className='w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold'>
          {author.charAt(0).toUpperCase()}
        </div>
        <div className='flex-1'>
          <h4 className='font-semibold text-sm'>{author}</h4>
          <p className='text-xs text-gray-600'>{timeAgo}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full border-2 ${tipTypeColors[tipType]} flex items-center space-x-1`}
        >
          <span className='text-sm'>{tipTypeIcons[tipType]}</span>
          <span className='text-xs font-medium'>{tipType.replace('-', ' ').toUpperCase()}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className='mb-4'>
        <p className='text-sm leading-relaxed'>{content}</p>
      </div>

      {/* Confidence Bar */}
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-medium text-gray-600'>Confidence Level</span>
          <span className='text-xs font-bold text-blue-600'>{confidence}%</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300'
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>

      {/* Post Actions */}
      <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
        <button className='flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-smooth'>
          <span className='text-lg'>👍</span>
          <span className='text-sm font-medium'>{likes}</span>
        </button>
        <button className='flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-smooth'>
          <span className='text-lg'>💬</span>
          <span className='text-sm font-medium'>{comments}</span>
        </button>
        <button className='flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-smooth'>
          <span className='text-lg'>📤</span>
          <span className='text-sm font-medium'>{shares}</span>
        </button>
        <button className='bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-xs font-medium'>
          Follow Tip
        </button>
      </div>
    </article>
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
      <div className='bg-white rounded-lg border p-4 shadow-sm'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='w-10 h-10 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold'>
            Y
          </div>
          <div className='flex-1'>
            <textarea
              placeholder='Share your sports tip or prediction...'
              className='w-full resize-none border-0 bg-transparent text-sm placeholder:text-gray-500 focus:outline-none'
              rows={3}
            />
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button className='px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50'>
              ⚽ Match
            </button>
            <button className='px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50'>
              📊 Over/Under
            </button>
            <button className='px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50'>
              ⚖️ Handicap
            </button>
          </div>
          <button className='bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium'>
            Share Tip
          </button>
        </div>
      </div>

      {/* Feed Posts */}
      {samplePosts.map((post, index) => (
        <FeedPost key={index} {...post} />
      ))}

      {/* Load More */}
      <div className='flex justify-center pt-6'>
        <button className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'>
          Load More Tips
        </button>
      </div>
    </div>
  );
}
