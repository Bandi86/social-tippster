import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentResponseDto, ListCommentsQueryDto } from '../admin/dto';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User): Promise<CommentResponseDto> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId: user.user_id,
    });
    const saved = await this.commentRepository.save(comment);
    return this.mapToResponseDto(saved);
  }

  async findAll(query: ListCommentsQueryDto): Promise<{
    comments: CommentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      postId,
      parentCommentId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const qb = this.commentRepository.createQueryBuilder('comment');
    qb.leftJoinAndSelect('comment.user', 'user');
    qb.leftJoinAndSelect('comment.replies', 'replies');
    qb.where('1=1');
    if (postId) {
      qb.andWhere('comment.postId = :postId', { postId });
    }
    if (parentCommentId) {
      qb.andWhere('comment.parentCommentId = :parentCommentId', { parentCommentId });
    }
    qb.orderBy(`comment.${sortBy}`, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);
    const [comments, total] = await qb.getManyAndCount();
    return {
      comments: comments.map(c => this.mapToResponseDto(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReplies(
    id: string,
    query: ListCommentsQueryDto,
  ): Promise<{
    comments: CommentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc' } = query;
    const qb = this.commentRepository.createQueryBuilder('comment');
    qb.leftJoinAndSelect('comment.user', 'user');
    qb.where('comment.parentCommentId = :id', { id });
    qb.orderBy(`comment.${sortBy}`, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);
    const [comments, total] = await qb.getManyAndCount();
    return {
      comments: comments.map(c => this.mapToResponseDto(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'replies'],
    });
    if (!comment) throw new NotFoundException('Komment nem található');
    return this.mapToResponseDto(comment);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Komment nem található');
    if (comment.userId !== user.user_id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Nincs jogosultság a komment törléséhez');
    }
    await this.commentRepository.delete(id);
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'replies'],
    });
    if (!comment) throw new NotFoundException('Komment nem található');
    if (comment.userId !== user.user_id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Nincs jogosultság a komment módosításához');
    }
    Object.assign(comment, updateCommentDto);
    const saved = await this.commentRepository.save(comment);
    return this.mapToResponseDto(saved);
  }

  async vote(dto: { commentId: string; value: 1 | -1 }, user: User): Promise<CommentResponseDto> {
    void user;
    const comment = await this.commentRepository.findOne({
      where: { id: dto.commentId },
      relations: ['user', 'replies'],
    });
    if (!comment) throw new NotFoundException('Komment nem található');
    // ... voting logic here ...
    return this.mapToResponseDto(comment);
  }

  async report(
    dto: { commentId: string; reason: string },
    user: User,
  ): Promise<{ message: string }> {
    void dto;
    void user;
    // Stub: Implement actual reporting logic
    return Promise.resolve({ message: 'Report received (stub)' });
  }

  async flag(id: string, reason: string, user: User): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'replies'],
    });
    if (!comment) throw new NotFoundException('Komment nem található');
    comment.flagReason = reason;
    comment.flaggedAt = new Date();
    comment.flaggedBy = user.user_id;
    const saved = await this.commentRepository.save(comment);
    return this.mapToResponseDto(saved);
  }

  async unflag(id: string, user: User): Promise<CommentResponseDto> {
    void user;
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'replies'],
    });
    if (!comment) throw new NotFoundException('Komment nem található');
    comment.flagReason = null;
    comment.flaggedAt = null;
    comment.flaggedBy = null;
    const saved = await this.commentRepository.save(comment);
    return this.mapToResponseDto(saved);
  }

  // Admin: findAllForAdmin (filtered, paginated, with meta)
  async findAllForAdmin(query: ListCommentsQueryDto): Promise<{
    comments: CommentResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    // Use type assertion to allow index signature access
    const q = query as ListCommentsQueryDto & { [key: string]: unknown };
    const postId = typeof q.postId === 'string' ? q.postId : undefined;
    const authorId = typeof q['authorId'] === 'string' ? q['authorId'] : undefined;
    const search = typeof q['search'] === 'string' ? q['search'] : undefined;
    const status = typeof q['status'] === 'string' ? q['status'] : undefined;
    let page: number;
    if (typeof q['page'] === 'string') {
      page = parseInt(q['page'] as string, 10);
    } else if (typeof q['page'] === 'number') {
      page = q['page'];
    } else {
      page = 1;
    }
    let limit: number;
    if (typeof q['limit'] === 'string') {
      limit = parseInt(q['limit'] as string, 10);
    } else if (typeof q['limit'] === 'number') {
      limit = q['limit'];
    } else {
      limit = 20;
    }
    const sortBy = typeof q['sortBy'] === 'string' ? q['sortBy'] : 'createdAt';
    let sortOrder: string;
    if (typeof q['sortOrder'] === 'string') {
      sortOrder = q['sortOrder'].toUpperCase();
    } else {
      sortOrder = 'DESC';
    }
    const qb = this.commentRepository.createQueryBuilder('comment');
    qb.leftJoinAndSelect('comment.user', 'user');
    qb.leftJoinAndSelect('comment.replies', 'replies');
    qb.where('1=1');
    if (postId) qb.andWhere('comment.postId = :postId', { postId });
    if (authorId) qb.andWhere('comment.userId = :authorId', { authorId });
    if (search) qb.andWhere('comment.content ILIKE :search', { search: `%${search}%` });
    if (status && status !== 'all') {
      if (status === 'flagged') qb.andWhere('comment.flaggedAt IS NOT NULL');
      else if (status === 'reported') qb.andWhere('comment.flagReason IS NOT NULL');
      else qb.andWhere('comment.status = :status', { status });
    }
    qb.orderBy(`comment.${sortBy}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);
    const [comments, total] = await qb.getManyAndCount();
    return {
      comments: comments.map(c => this.mapToResponseDto(c)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: bulkAction (delete, flag, unflag)
  async bulkAction(
    commentIds: string[],
    action: 'delete' | 'flag' | 'unflag',
    user: User,
    reason?: string,
  ): Promise<{ message: string; processed: number }> {
    let processed = 0;
    for (const id of commentIds) {
      if (action === 'delete') {
        await this.remove(id, user);
        processed++;
      } else if (action === 'flag') {
        await this.flag(id, reason || 'Flagged by admin', user);
        processed++;
      } else if (action === 'unflag') {
        await this.unflag(id, user);
        processed++;
      }
    }
    return { message: 'Tömeges művelet befejezve', processed };
  }

  private mapToResponseDto(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId || undefined,
      user: comment.user
        ? {
            id: comment.user.user_id,
            username: comment.user.username,
            isVerified: comment.user.is_verified,
            email: comment.user.email,
          }
        : {
            id: '',
            username: '',
            isVerified: false,
            email: '',
          },
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      userVote: null, // TODO: implement user-specific vote lookup
      replyCount: Array.isArray(comment.replies) ? comment.replies.length : 0,
      flagReason: typeof comment.flagReason === 'string' ? comment.flagReason : undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isDeleted: false, // TODO: implement if needed
      deletedAt: undefined, // TODO: implement if needed
      isEdited: false, // TODO: implement if needed
      mentionedUsers: [], // TODO: implement if needed
      replies: undefined, // TODO: implement if needed
    };
  }
}
