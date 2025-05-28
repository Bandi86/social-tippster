import { apiClient } from '../../api-client';

export interface PostStats {
  total: number;
  published: number;
  draft: number;
  hidden: number;
  reported: number;
  totalViews: number;
  totalLikes: number;
  recentPosts: number;
}

export interface UserStats {
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
}

export interface CommentStats {
  total: number;
  active: number;
  flagged: number;
  reported: number;
  recentComments: number;
}

export interface UserGrowthData {
  month: string;
  users: number;
}

export interface ActivityData {
  date: string;
  logins: number;
  registrations: number;
}

export interface ComprehensiveAnalytics {
  userStats: UserStats;
  postStats: PostStats;
  commentStats: CommentStats;
  userGrowth: UserGrowthData[];
  activityData: ActivityData[];
}

// Get post statistics
export async function fetchPostStats(): Promise<PostStats> {
  try {
    const response = await apiClient.get('/admin/analytics/posts');
    return response.data as PostStats;
  } catch (error) {
    console.error('Error fetching post stats:', error);
    throw error;
  }
}

// Get user statistics
export async function fetchUserStats(): Promise<UserStats> {
  try {
    const response = await apiClient.get('/admin/analytics/users');
    return response.data as UserStats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

// Get comment statistics
export async function fetchCommentStats(): Promise<CommentStats> {
  try {
    const response = await apiClient.get('/admin/analytics/comments');
    return response.data as CommentStats;
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    throw error;
  }
}

// Get user growth data
export async function fetchUserGrowthData(): Promise<UserGrowthData[]> {
  try {
    const response = await apiClient.get('/admin/analytics/user-growth');
    return response.data as UserGrowthData[];
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    throw error;
  }
}

// Get activity data
export async function fetchActivityData(): Promise<ActivityData[]> {
  try {
    const response = await apiClient.get('/admin/analytics/activity');
    return response.data as ActivityData[];
  } catch (error) {
    console.error('Error fetching activity data:', error);
    throw error;
  }
}

// Get comprehensive analytics
export async function fetchComprehensiveAnalytics(): Promise<ComprehensiveAnalytics> {
  try {
    const response = await apiClient.get('/admin/analytics/comprehensive');
    return response.data as ComprehensiveAnalytics;
  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    throw error;
  }
}
