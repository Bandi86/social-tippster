import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CommentVoteDto } from './dto/comment-vote.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto, SortOrder } from './dto/list-comments-query.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReport, ReportStatus } from './entities/comment-report.entity';
import { CommentVote, VoteType } from './entities/comment-vote.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentVote)
    private readonly commentVoteRepository: Repository<CommentVote>,
    @InjectRepository(CommentReport)
    private readonly commentReportRepository: Repository<CommentReport>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User): Promise<CommentResponseDto> {
    // Validate parent comment exists if provided
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentCommentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Szülő hozzászólás nem található');
      }

      // Check if parent comment belongs to the same post
      if (parentComment.postId !== createCommentDto.postId) {
        throw new BadRequestException('A szülő hozzászólás nem ehhez a poszthoz tartozik');
      }
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId: user.user_id,
    });

    const savedComment = await this.commentRepository.save(comment);

    return this.findOneWithDetails(savedComment.id);
  }

  async findAll(query: ListCommentsQueryDto): Promise<{
    comments: CommentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      postId,
      parentCommentId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.votes', 'votes')
      .leftJoinAndSelect('comment.replies', 'replies')
      .where('comment.flagReason IS NULL'); // Only show non-flagged comments

    if (postId) {
      queryBuilder.andWhere('comment.postId = :postId', { postId });
    }

    if (parentCommentId) {
      queryBuilder.andWhere('comment.parentCommentId = :parentCommentId', { parentCommentId });
    } else {
      // Only top-level comments if no parent specified
      queryBuilder.andWhere('comment.parentCommentId IS NULL');
    }

    queryBuilder
      .orderBy(`comment.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [comments, total] = await queryBuilder.getManyAndCount();

    const commentDtos = await Promise.all(comments.map(comment => this.mapToResponseDto(comment)));

    return {
      comments: commentDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.findOneWithDetails(id);
    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }

    // Check if user owns the comment
    if (comment.userId !== user.user_id) {
      throw new ForbiddenException('Csak a saját hozzászólásaidat szerkesztheted');
    }

    // Update comment
    Object.assign(comment, updateCommentDto);
    await this.commentRepository.save(comment);

    return this.findOneWithDetails(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== user.user_id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Csak a saját hozzászólásaidat törölheted');
    }

    await this.commentRepository.remove(comment);
  }

  async vote(commentVoteDto: CommentVoteDto, user: User): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentVoteDto.commentId },
    });

    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }

    // Check for existing vote
    const existingVote = await this.commentVoteRepository.findOne({
      where: {
        commentId: commentVoteDto.commentId,
        userId: user.user_id,
      },
    });

    if (existingVote) {
      if (existingVote.value === commentVoteDto.value) {
        // Remove vote if same value (toggle off)
        await this.commentVoteRepository.remove(existingVote);
        await this.updateVoteCounts(comment);
      } else {
        // Update vote if different value
        existingVote.value = commentVoteDto.value;
        await this.commentVoteRepository.save(existingVote);
        await this.updateVoteCounts(comment);
      }
    } else {
      // Create new vote
      const newVote = this.commentVoteRepository.create({
        commentId: commentVoteDto.commentId,
        userId: user.user_id,
        value: commentVoteDto.value,
      });
      await this.commentVoteRepository.save(newVote);
      await this.updateVoteCounts(comment);
    }

    return this.findOneWithDetails(commentVoteDto.commentId);
  }

  async report(reportCommentDto: ReportCommentDto, user: User): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({
      where: { id: reportCommentDto.commentId },
    });

    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }

    // Check if user already reported this comment
    const existingReport = await this.commentReportRepository.findOne({
      where: {
        commentId: reportCommentDto.commentId,
        reporterId: user.user_id,
      },
    });

    if (existingReport) {
      throw new BadRequestException('Ezt a hozzászólást már bejelentetted');
    }

    // Create report
    const report = this.commentReportRepository.create({
      commentId: reportCommentDto.commentId,
      reporterId: user.user_id,
      reason: reportCommentDto.reason,
      status: ReportStatus.PENDING,
    });

    await this.commentReportRepository.save(report);

    return { message: 'Hozzászólás sikeresen bejelentve' };
  }

  async flag(id: string, reason: string, user: User): Promise<CommentResponseDto> {
    // Only admins can flag comments
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Csak adminisztrátorok jelölhetik meg a hozzászólásokat');
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }

    comment.flagReason = reason;
    await this.commentRepository.save(comment);

    return this.findOneWithDetails(id);
  }

  async unflag(id: string, user: User): Promise<CommentResponseDto> {
    // Only admins can unflag comments
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Csak adminisztrátorok távolíthatják el a jelölést');
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }

    comment.flagReason = null;
    await this.commentRepository.save(comment);

    return this.findOneWithDetails(id);
  }

  async getReplies(
    commentId: string,
    query: ListCommentsQueryDto,
  ): Promise<{
    comments: CommentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = SortOrder.ASC } = query;

    return this.findAll({
      ...query,
      parentCommentId: commentId,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  private async findOneWithDetails(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'votes', 'replies', 'replies.user'],
    });

    if (!comment) {
      throw new NotFoundException('Hozzászólás nem található');
    }

    return this.mapToResponseDto(comment);
  }

  private async mapToResponseDto(comment: Comment): Promise<CommentResponseDto> {
    const replyCount = await this.commentRepository.count({
      where: { parentCommentId: comment.id },
    });

    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId ?? undefined,
      user: {
        id: comment.user.user_id,
        username: comment.user.username,
        email: comment.user.email,
      },
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      userVote: null, // This would need the current user context to determine
      replyCount,
      flagReason: comment.flagReason ?? undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  private async updateVoteCounts(comment: Comment): Promise<void> {
    const upvotes = await this.commentVoteRepository.count({
      where: { commentId: comment.id, value: VoteType.UPVOTE },
    });

    const downvotes = await this.commentVoteRepository.count({
      where: { commentId: comment.id, value: VoteType.DOWNVOTE },
    });

    comment.upvotes = upvotes;
    comment.downvotes = downvotes;

    await this.commentRepository.save(comment);
  }
}
