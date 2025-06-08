// User API types and functions
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  profile_image?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  reputation_score?: number;
  is_verified?: boolean;
  is_banned?: boolean;
  role?: 'user' | 'admin' | 'moderator';
  posts_count?: number;
  comments_count?: number;
  followers_count?: number;
  following_count?: number;
}

export interface UserStats {
  posts_count: number;
  comments_count: number;
  likes_received: number;
  reputation_score: number;
}

// API functions would go here when needed
export async function fetchUserProfile(id: string): Promise<UserProfile> {
  // This would be implemented with actual API calls
  throw new Error('Not implemented yet');
}

export async function updateUserProfile(
  id: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  // This would be implemented with actual API calls
  throw new Error('Not implemented yet');
}
