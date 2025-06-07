'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showFollowTabs?: boolean;
  counts: {
    posts: number;
    followers: number;
    following: number;
  };
}

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  showFollowTabs = false, 
  counts 
}: ProfileTabsProps) {
  const tabs = [
    { id: 'posts', label: 'Posztok', count: counts.posts },
    { id: 'tips', label: 'Tippek', count: 0 },
    ...(showFollowTabs ? [
      { id: 'followers', label: 'Követők', count: counts.followers },
      { id: 'following', label: 'Követett', count: counts.following },
    ] : [])
  ];

  return (
    <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === tab.id
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          )}
        >
          <span>{tab.label}</span>
          {tab.count > 0 && (
            <span className={cn(
              'ml-2 px-2 py-0.5 text-xs rounded-full',
              activeTab === tab.id
                ? 'bg-amber-700 text-amber-100'
                : 'bg-gray-600 text-gray-300'
            )}>
              {tab.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
