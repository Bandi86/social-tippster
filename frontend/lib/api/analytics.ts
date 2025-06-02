// ===============================
// Analytics API Integration
// All analytics-related API calls for the admin dashboard
// ===============================

import axios from '@/lib/axios';
import {
  ActivityData,
  CommentStats,
  ComprehensiveAnalytics,
  PostStats,
  UserGrowthData,
  UserStats,
} from '@/types/analytics';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Authenticated axios request helper
async function axiosWithAuth(config: any) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await axios({ ...config, headers });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ===============================
// Analytics API Functions
// ===============================

// Fetch user statistics for admin dashboard
export async function fetchUserStats(): Promise<UserStats> {
  return await axiosWithAuth({
    method: 'GET',
    url: `${API_BASE_URL}/admin/analytics/users`,
  });
}

// Fetch post statistics for admin dashboard
export async function fetchPostStats(): Promise<PostStats> {
  return await axiosWithAuth({
    method: 'GET',
    url: `${API_BASE_URL}/admin/analytics/posts`,
  });
}

// Fetch comment statistics for admin dashboard
export async function fetchCommentStats(): Promise<CommentStats> {
  return await axiosWithAuth({
    method: 'GET',
    url: `${API_BASE_URL}/admin/analytics/comments`,
  });
}

// Fetch user growth data for charts
export async function fetchUserGrowthData(): Promise<UserGrowthData[]> {
  return await axiosWithAuth({
    method: 'GET',
    url: `${API_BASE_URL}/admin/analytics/user-growth`,
  });
}

// Fetch activity data for charts
export async function fetchActivityData(): Promise<ActivityData[]> {
  return await axiosWithAuth({
    method: 'GET',
    url: `${API_BASE_URL}/admin/analytics/activity`,
  });
}

// Fetch comprehensive analytics (all data in one call)
export async function fetchComprehensiveAnalytics(): Promise<ComprehensiveAnalytics> {
  return await axiosWithAuth({
    method: 'GET',
    url: `${API_BASE_URL}/admin/analytics/comprehensive`,
  });
}
