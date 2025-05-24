import api from '@/lib/api/axios';
import { User } from '@/store/auth';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
}

export interface GetPostsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PostsResponse {
  data: Post[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Service for handling posts operations
 */
export const PostsService = {
  /**
   * Get all posts with pagination
   */
  getPosts: async (query: GetPostsQuery = {}): Promise<PostsResponse> => {
    const response = await api.get<PostsResponse>('/posts', { params: query });
    return response.data;
  },

  /**
   * Get a post by id
   */
  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  /**
   * Create a new post
   */
  createPost: async (postData: CreatePostDto): Promise<Post> => {
    const response = await api.post<Post>('/posts', postData);
    return response.data;
  },

  /**
   * Update a post
   */
  updatePost: async (id: string, postData: Partial<CreatePostDto>): Promise<Post> => {
    const response = await api.patch<Post>(`/posts/${id}`, postData);
    return response.data;
  },

  /**
   * Delete a post
   */
  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};
