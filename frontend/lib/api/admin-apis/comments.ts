// API service for admin comments management

export interface AdminComment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    role: string;
    is_banned: boolean;
  };
  post: {
    id: string;
    title: string;
    type: string;
    author_username: string;
  };
  parent_comment_id?: string;
  status: 'active' | 'hidden' | 'deleted' | 'pending';
  likes_count: number;
  dislikes_count: number;
  replies_count: number;
  is_reported: boolean;
  reports_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CommentsFilters {
  search?: string;
  status?: string;
  post_id?: string;
  author_id?: string;
  is_reported?: boolean;
  is_pinned?: boolean;
  date_from?: string;
  date_to?: string;
  sort?: 'newest' | 'oldest' | 'most_liked' | 'most_reported' | 'most_replies';
  page?: number;
  limit?: number;
}

export interface AdminCommentsResponse {
  comments: AdminComment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fetch paginated comments with filters
export async function fetchAdminComments(
  filters: CommentsFilters = {},
): Promise<AdminCommentsResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.post_id) params.append('post_id', filters.post_id);
  if (filters.author_id) params.append('author_id', filters.author_id);
  if (filters.is_reported !== undefined)
    params.append('is_reported', filters.is_reported.toString());
  if (filters.is_pinned !== undefined) params.append('is_pinned', filters.is_pinned.toString());
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.sort) params.append('sort', filters.sort);

  params.append('page', (filters.page || 1).toString());
  params.append('limit', (filters.limit || 20).toString());

  try {
    // For demo purposes, we'll simulate admin comments data
    // In production, this would connect to: GET /api/admin/comments
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    const mockComments: AdminComment[] = [
      {
        id: '1',
        content: 'Great tip! I followed this and won big. Thanks for sharing your analysis.',
        author: {
          id: 'user1',
          username: 'sportsfan123',
          email: 'sportsfan123@example.com',
          role: 'user',
          is_banned: false,
        },
        post: {
          id: 'post1',
          title: 'Manchester United vs Liverpool - Premier League Prediction',
          type: 'tip',
          author_username: 'tipster_pro',
        },
        status: 'active',
        likes_count: 12,
        dislikes_count: 1,
        replies_count: 3,
        is_reported: false,
        reports_count: 0,
        is_pinned: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        content:
          "This is completely wrong analysis. You have no idea what you're talking about. Waste of time.",
        author: {
          id: 'user2',
          username: 'angry_bettor',
          email: 'angry_bettor@example.com',
          role: 'user',
          is_banned: false,
        },
        post: {
          id: 'post2',
          title: 'Chelsea Transfer News and Impact Analysis',
          type: 'analysis',
          author_username: 'football_analyst',
        },
        status: 'active',
        likes_count: 2,
        dislikes_count: 8,
        replies_count: 1,
        is_reported: true,
        reports_count: 3,
        is_pinned: false,
        created_at: '2024-01-15T09:15:00Z',
        updated_at: '2024-01-15T09:15:00Z',
      },
      {
        id: '3',
        content: "Excellent breakdown of the team's defensive strategy. Very insightful analysis!",
        author: {
          id: 'user3',
          username: 'tactical_fan',
          email: 'tactical_fan@example.com',
          role: 'user',
          is_banned: false,
        },
        post: {
          id: 'post3',
          title: 'Arsenal vs Manchester City - Tactical Preview',
          type: 'analysis',
          author_username: 'coach_insights',
        },
        status: 'active',
        likes_count: 18,
        dislikes_count: 0,
        replies_count: 5,
        is_reported: false,
        reports_count: 0,
        is_pinned: true,
        created_at: '2024-01-15T08:45:00Z',
        updated_at: '2024-01-15T08:45:00Z',
      },
      {
        id: '4',
        content:
          'SPAM: Click here for guaranteed wins! 🎰💰 Best betting tips! Visit our site now!',
        author: {
          id: 'user4',
          username: 'spam_account',
          email: 'spam@example.com',
          role: 'user',
          is_banned: true,
        },
        post: {
          id: 'post4',
          title: 'Weekly Football Predictions Thread',
          type: 'discussion',
          author_username: 'community_mod',
        },
        status: 'hidden',
        likes_count: 0,
        dislikes_count: 15,
        replies_count: 0,
        is_reported: true,
        reports_count: 8,
        is_pinned: false,
        created_at: '2024-01-15T07:20:00Z',
        updated_at: '2024-01-15T07:20:00Z',
      },
      {
        id: '5',
        content:
          'Thanks for the detailed post-match analysis. The statistics you provided were very helpful.',
        author: {
          id: 'user5',
          username: 'data_lover',
          email: 'data_lover@example.com',
          role: 'user',
          is_banned: false,
        },
        post: {
          id: 'post5',
          title: 'Liverpool vs Real Madrid - Champions League Review',
          type: 'analysis',
          author_username: 'match_analyst',
        },
        status: 'active',
        likes_count: 7,
        dislikes_count: 0,
        replies_count: 2,
        is_reported: false,
        reports_count: 0,
        is_pinned: false,
        created_at: '2024-01-15T06:30:00Z',
        updated_at: '2024-01-15T06:30:00Z',
      },
    ];

    // Apply filters
    let filteredComments = mockComments;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredComments = filteredComments.filter(
        comment =>
          comment.content.toLowerCase().includes(searchTerm) ||
          comment.author.username.toLowerCase().includes(searchTerm) ||
          comment.post.title.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.status && filters.status !== 'all') {
      filteredComments = filteredComments.filter(comment => comment.status === filters.status);
    }

    if (filters.is_reported !== undefined) {
      filteredComments = filteredComments.filter(
        comment => comment.is_reported === filters.is_reported,
      );
    }

    if (filters.is_pinned !== undefined) {
      filteredComments = filteredComments.filter(
        comment => comment.is_pinned === filters.is_pinned,
      );
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          filteredComments.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );
          break;
        case 'oldest':
          filteredComments.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );
          break;
        case 'most_liked':
          filteredComments.sort((a, b) => b.likes_count - a.likes_count);
          break;
        case 'most_reported':
          filteredComments.sort((a, b) => b.reports_count - a.reports_count);
          break;
        case 'most_replies':
          filteredComments.sort((a, b) => b.replies_count - a.replies_count);
          break;
      }
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedComments = filteredComments.slice(start, end);

    return {
      comments: paginatedComments,
      meta: {
        total: filteredComments.length,
        page,
        limit,
        totalPages: Math.ceil(filteredComments.length / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    throw error;
  }
}

// Get single comment by ID
export async function fetchCommentById(id: string): Promise<AdminComment> {
  try {
    // Mock single comment fetch
    const { comments } = await fetchAdminComments({ limit: 1000 });
    const comment = comments.find(c => c.id === id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment;
  } catch (error) {
    console.error('Error fetching comment:', error);
    throw error;
  }
}

// Delete comment
export async function deleteComment(id: string): Promise<void> {
  try {
    // In production: DELETE /api/admin/comments/:id
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Comment ${id} deleted`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Update comment status
export async function updateCommentStatus(
  id: string,
  status: 'active' | 'hidden' | 'pending',
): Promise<AdminComment> {
  try {
    // In production: PATCH /api/admin/comments/:id
    await new Promise(resolve => setTimeout(resolve, 300));
    const comment = await fetchCommentById(id);
    return { ...comment, status, updated_at: new Date().toISOString() };
  } catch (error) {
    console.error('Error updating comment status:', error);
    throw error;
  }
}

// Toggle comment pin status
export async function toggleCommentPin(id: string): Promise<AdminComment> {
  try {
    // In production: PATCH /api/admin/comments/:id/pin
    await new Promise(resolve => setTimeout(resolve, 300));
    const comment = await fetchCommentById(id);
    return { ...comment, is_pinned: !comment.is_pinned, updated_at: new Date().toISOString() };
  } catch (error) {
    console.error('Error toggling comment pin:', error);
    throw error;
  }
}

// Bulk delete comments
export async function bulkDeleteComments(ids: string[]): Promise<void> {
  try {
    // In production: DELETE /api/admin/comments/bulk
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Bulk deleted ${ids.length} comments`);
  } catch (error) {
    console.error('Error bulk deleting comments:', error);
    throw error;
  }
}

// Bulk update comment status
export async function bulkUpdateCommentsStatus(
  ids: string[],
  status: 'active' | 'hidden' | 'pending',
): Promise<void> {
  try {
    // In production: PATCH /api/admin/comments/bulk
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Bulk updated ${ids.length} comments to ${status}`);
  } catch (error) {
    console.error('Error bulk updating comments:', error);
    throw error;
  }
}

// Get comments statistics for admin dashboard
export async function fetchCommentsStats(): Promise<{
  total: number;
  active: number;
  hidden: number;
  pending: number;
  reported: number;
  pinned: number;
  totalLikes: number;
  recentComments: number;
}> {
  try {
    // For now, we'll calculate this from the comments list
    // In a real implementation, this would be a dedicated endpoint
    const { comments } = await fetchAdminComments({ limit: 1000 });

    const stats = comments.reduce(
      (acc, comment) => {
        acc.total++;
        if (comment.status === 'active') acc.active++;
        else if (comment.status === 'hidden') acc.hidden++;
        else if (comment.status === 'pending') acc.pending++;
        if (comment.is_reported) acc.reported++;
        if (comment.is_pinned) acc.pinned++;
        acc.totalLikes += comment.likes_count;

        // Count comments from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (new Date(comment.created_at) > weekAgo) {
          acc.recentComments++;
        }

        return acc;
      },
      {
        total: 0,
        active: 0,
        hidden: 0,
        pending: 0,
        reported: 0,
        pinned: 0,
        totalLikes: 0,
        recentComments: 0,
      },
    );

    return stats;
  } catch (error) {
    console.error('Error fetching comments stats:', error);
    throw error;
  }
}
