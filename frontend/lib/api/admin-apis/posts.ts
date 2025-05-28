// Posts-related API calls for admin panel

import { apiClient } from '@/lib/api-client';

// Post interface extending the basic post structure
export interface AdminPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  type: 'tip' | 'discussion' | 'question' | 'analysis';
  status: 'draft' | 'published' | 'archived' | 'hidden';
  tags?: string[];
  author_id: string;
  author?: {
    username: string;
    email: string;
    profile_image?: string;
  };
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  bookmarks_count: number;
  shares_count: number;
  is_featured: boolean;
  is_reported: boolean;
  reports_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  deleted_at?: string;
}

// Get all posts with admin-level access and filtering
export async function fetchAdminPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  author?: string;
  sortBy?: 'created_at' | 'updated_at' | 'views_count' | 'likes_count' | 'reports_count';
  sortOrder?: 'asc' | 'desc';
}): Promise<{ posts: AdminPost[]; total: number }> {
  const response = await apiClient.get('/posts', { params });

  // Transform the response to match our interface
  const responseData = response.data;
  const posts = responseData.posts || responseData.data || [];
  const total = responseData.total || posts.length;

  const mappedPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    type: post.type || 'tip',
    status: post.status || 'published',
    tags: post.tags || [],
    author_id: post.author_id,
    author: post.author
      ? {
          username: post.author.username,
          email: post.author.email,
          profile_image: post.author.profile_image,
        }
      : undefined,
    views_count: post.views_count || 0,
    likes_count: post.likes_count || 0,
    dislikes_count: post.dislikes_count || 0,
    comments_count: post.comments_count || 0,
    bookmarks_count: post.bookmarks_count || 0,
    shares_count: post.shares_count || 0,
    is_featured: post.is_featured || false,
    is_reported: post.is_reported || false,
    reports_count: post.reports_count || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
    deleted_at: post.deleted_at,
  }));

  return {
    posts: mappedPosts,
    total,
  };
}

// Get single post details for admin
export async function fetchPostById(postId: string): Promise<AdminPost> {
  const response = await apiClient.get(`/posts/${postId}`);
  const post = response.data;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    type: post.type || 'tip',
    status: post.status || 'published',
    tags: post.tags || [],
    author_id: post.author_id,
    author: post.author
      ? {
          username: post.author.username,
          email: post.author.email,
          profile_image: post.author.profile_image,
        }
      : undefined,
    views_count: post.views_count || 0,
    likes_count: post.likes_count || 0,
    dislikes_count: post.dislikes_count || 0,
    comments_count: post.comments_count || 0,
    bookmarks_count: post.bookmarks_count || 0,
    shares_count: post.shares_count || 0,
    is_featured: post.is_featured || false,
    is_reported: post.is_reported || false,
    reports_count: post.reports_count || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
    deleted_at: post.deleted_at,
  };
}

// Delete post (admin can delete any post)
export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}`);
}

// Update post status or other admin-specific properties
export async function updatePost(postId: string, updates: Partial<AdminPost>): Promise<AdminPost> {
  const response = await apiClient.patch(`/posts/${postId}`, updates);
  return response.data;
}

// Get posts statistics for admin dashboard
export async function fetchPostsStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  hidden: number;
  reported: number;
  totalViews: number;
  totalLikes: number;
  recentPosts: number;
}> {
  // For now, we'll calculate this from the posts list
  // In a real implementation, this would be a dedicated endpoint
  const { posts } = await fetchAdminPosts({ limit: 1000 });

  const stats = posts.reduce(
    (acc, post) => {
      acc.total++;
      if (post.status === 'published') acc.published++;
      else if (post.status === 'draft') acc.draft++;
      else if (post.status === 'hidden') acc.hidden++;
      if (post.is_reported) acc.reported++;
      acc.totalViews += post.views_count;
      acc.totalLikes += post.likes_count;

      // Count posts from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (new Date(post.created_at) > weekAgo) {
        acc.recentPosts++;
      }

      return acc;
    },
    {
      total: 0,
      published: 0,
      draft: 0,
      hidden: 0,
      reported: 0,
      totalViews: 0,
      totalLikes: 0,
      recentPosts: 0,
    },
  );

  return stats;
}

// Feature/unfeature post
export async function togglePostFeature(postId: string, featured: boolean): Promise<AdminPost> {
  return updatePost(postId, { is_featured: featured });
}

// Hide/unhide post
export async function togglePostVisibility(postId: string, hidden: boolean): Promise<AdminPost> {
  const status = hidden ? 'hidden' : 'published';
  return updatePost(postId, { status });
}

// Bulk operations
export async function bulkDeletePosts(postIds: string[]): Promise<void> {
  await Promise.all(postIds.map(id => deletePost(id)));
}

export async function bulkUpdatePosts(
  postIds: string[],
  updates: Partial<AdminPost>,
): Promise<void> {
  await Promise.all(postIds.map(id => updatePost(id, updates)));
}
