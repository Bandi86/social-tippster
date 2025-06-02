// ===============================
// Analytics Types for Frontend
// Interfaces matching backend analytics service responses
// ===============================

export interface UserStats {
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
}

export interface PostStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  reported: number;
  totalViews: number;
  totalLikes: number;
  recentPosts: number;
}

export interface CommentStats {
  total: number;
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
