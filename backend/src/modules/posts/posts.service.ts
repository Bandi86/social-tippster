import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Post,
  PostBookmark,
  PostComment,
  PostCommentVote,
  PostShare,
  PostView,
  PostVote,
} from './entities';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
    @InjectRepository(PostBookmark)
    private readonly postBookmarkRepository: Repository<PostBookmark>,
    @InjectRepository(PostShare)
    private readonly postShareRepository: Repository<PostShare>,
    @InjectRepository(PostView)
    private readonly postViewRepository: Repository<PostView>,
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
    @InjectRepository(PostCommentVote)
    private readonly postCommentVoteRepository: Repository<PostCommentVote>,
  ) {}

  async createPost(createPostDto: Partial<Post>, authorId: string): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      author_id: authorId,
    });
    return await this.postRepository.save(post);
  }

  async findAllPosts(queryDto?: { limit?: number }): Promise<{ posts: Post[]; total: number }> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' })
      .orderBy('post.created_at', 'DESC');

    if (queryDto?.limit && typeof queryDto.limit === 'number') {
      queryBuilder.limit(queryDto.limit);
    }

    const [posts, total] = await queryBuilder.getManyAndCount();
    return { posts, total };
  }

  async findPostById(id: string): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async updatePost(id: string, updatePostDto: Partial<Post>): Promise<Post | null> {
    await this.postRepository.update(id, updatePostDto);
    return await this.findPostById(id);
  }

  async deletePost(id: string): Promise<void> {
    await this.postRepository.update(id, { deleted_at: new Date() });
  }

  // TODO: Implement service methods for post interactions (vote, bookmark, share, view)
  // TODO: Implement service methods for comment system

}
