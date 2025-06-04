import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateTipDto } from './dto/create-tip.dto';
import { LeaderboardEntryDto, SetTipResultDto, UserTipStatsDto } from './dto/tip-result.dto';
import { Post, PostType, TipResult } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { TipValidationService } from './tip-validation.service';

interface TipStatsRaw {
  totalTips: string;
  wonTips: string;
  lostTips: string;
  pendingTips: string;
  averageOdds: string;
  totalProfit: string;
}

interface LeaderboardRaw {
  userId: string;
  username: string;
  totalTips: string;
  wonTips: string;
  lostTips: string;
  totalProfit: string;
}

@Injectable()
export class TipsService {
  constructor(
    private readonly postsService: PostsService,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tipValidationService: TipValidationService,
  ) {}

  async createTip(createTipDto: CreateTipDto, authorId: string): Promise<Post> {
    // Validate tip before creation
    const validationResult = this.validateTip(createTipDto);
    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Tip validation failed',
        errors: validationResult.errors,
      });
    }

    // Create tip as a specialized post
    const tipData = {
      ...createTipDto,
      type: PostType.TIP,
      match_name: createTipDto.matchName,
      match_date: new Date(createTipDto.matchDate),
      match_time: createTipDto.matchTime,
      tip_category: createTipDto.tipCategory,
      total_odds: createTipDto.totalOdds,
      submission_deadline: createTipDto.submissionDeadline
        ? new Date(createTipDto.submissionDeadline)
        : undefined,
      tip_result: TipResult.PENDING,
      is_result_set: false,
      is_valid_tip: true,
      validation_errors: [],
      author_id: authorId,
    };

    const tip = this.postRepository.create(tipData);
    return await this.postRepository.save(tip);
  }

  async setTipResult(tipId: string, setResultDto: SetTipResultDto, userId: string): Promise<Post> {
    const tip = await this.postRepository.findOne({
      where: { id: tipId, author_id: userId, type: PostType.TIP },
    });

    if (!tip) {
      throw new NotFoundException('Tip not found or you do not have permission to set its result');
    }

    if (tip.is_result_set) {
      throw new BadRequestException('Tip result has already been set');
    }

    // Update tip result
    tip.tip_result = setResultDto.result;
    tip.is_result_set = true;
    tip.tip_resolved_at = new Date();

    if (setResultDto.profit !== undefined) {
      tip.tip_profit = setResultDto.profit;
    } else {
      // Calculate profit based on result and stake
      tip.tip_profit = this.calculateProfit(tip, setResultDto.result);
    }

    const updatedTip = await this.postRepository.save(tip);

    // Update user statistics
    await this.updateUserTipStats(userId, setResultDto.result, tip.tip_profit);

    return updatedTip;
  }

  validateTip(createTipDto: CreateTipDto) {
    // Use TipValidationService for all checks
    const errors: string[] = [];
    const { matchDate, odds, matchId } = createTipDto;
    const now = new Date();
    if (!this.tipValidationService.validateSubmissionDeadline(new Date(matchDate), now)) {
      errors.push('A tipp leadási határideje lejárt.');
    }
    if (!this.tipValidationService.validateOdds(odds)) {
      errors.push('Az odds értéke érvénytelen.');
    }
    if (matchId && !this.tipValidationService.validateMatchExists()) {
      errors.push('A megadott meccs nem létezik.');
    }
    // User history check (optional, can be extended)
    // ...
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getUserTipStats(userId: string): Promise<UserTipStatsDto> {
    const tipStats = (await this.postRepository
      .createQueryBuilder('post')
      .select([
        'COUNT(*) as totalTips',
        'SUM(CASE WHEN tip_result = :won THEN 1 ELSE 0 END) as wonTips',
        'SUM(CASE WHEN tip_result = :lost THEN 1 ELSE 0 END) as lostTips',
        'SUM(CASE WHEN tip_result = :pending THEN 1 ELSE 0 END) as pendingTips',
        'AVG(CASE WHEN tip_result IN (:won, :lost) THEN odds END) as averageOdds',
        'SUM(COALESCE(tip_profit, 0)) as totalProfit',
      ])
      .where('author_id = :userId AND type = :type', {
        userId,
        type: PostType.TIP,
      })
      .setParameters({
        won: TipResult.WON,
        lost: TipResult.LOST,
        pending: TipResult.PENDING,
      })
      .getRawOne()) as TipStatsRaw;

    const winRate =
      parseInt(tipStats.totalTips) > 0
        ? (parseInt(tipStats.wonTips) /
            (parseInt(tipStats.wonTips) + parseInt(tipStats.lostTips))) *
          100
        : 0;

    // Calculate streaks
    const { currentStreak, bestStreak } = await this.calculateStreaks(userId);

    return {
      totalTips: parseInt(tipStats.totalTips) || 0,
      wonTips: parseInt(tipStats.wonTips) || 0,
      lostTips: parseInt(tipStats.lostTips) || 0,
      pendingTips: parseInt(tipStats.pendingTips) || 0,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit: parseFloat(tipStats.totalProfit) || 0,
      averageOdds: Math.round((parseFloat(tipStats.averageOdds) || 0) * 100) / 100,
      currentStreak,
      bestStreak,
    };
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntryDto[]> {
    const leaderboardData = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.author_id as userId',
        'user.username as username',
        'COUNT(*) as totalTips',
        'SUM(CASE WHEN tip_result = :won THEN 1 ELSE 0 END) as wonTips',
        'SUM(CASE WHEN tip_result = :lost THEN 1 ELSE 0 END) as lostTips',
        'SUM(COALESCE(tip_profit, 0)) as totalProfit',
      ])
      .leftJoin('post.author', 'user')
      .where('post.type = :type', { type: PostType.TIP })
      .andWhere('post.tip_result IN (:...results)', {
        results: [TipResult.WON, TipResult.LOST],
      })
      .groupBy('post.author_id, user.username')
      .having('COUNT(*) >= 10') // Minimum 10 tips to appear on leaderboard
      .orderBy(
        '(SUM(CASE WHEN tip_result = :won THEN 1 ELSE 0 END) / (SUM(CASE WHEN tip_result = :won THEN 1 ELSE 0 END) + SUM(CASE WHEN tip_result = :lost THEN 1 ELSE 0 END))) * 100',
        'DESC',
      )
      .addOrderBy('totalProfit', 'DESC')
      .setParameter('won', TipResult.WON)
      .limit(limit)
      .getRawMany();

    return leaderboardData.map((entry: LeaderboardRaw, index) => ({
      userId: entry.userId,
      username: entry.username,
      totalTips: parseInt(entry.totalTips),
      winRate:
        Math.round(
          (parseInt(entry.wonTips) / (parseInt(entry.wonTips) + parseInt(entry.lostTips))) *
            100 *
            100,
        ) / 100,
      totalProfit: parseFloat(entry.totalProfit) || 0,
      rank: index + 1,
      badge: this.getBadgeForRank(index + 1),
    }));
  }

  async checkDeadlines(): Promise<void> {
    const expiredTips = await this.postRepository.find({
      where: {
        type: PostType.TIP,
        tip_result: TipResult.PENDING,
      },
    });

    const now = new Date();

    for (const tip of expiredTips) {
      if (tip.submission_deadline && tip.submission_deadline < now) {
        // Mark as invalid due to missed deadline
        tip.is_valid_tip = false;
        tip.validation_errors = [...(tip.validation_errors || []), 'Submission deadline missed'];
        await this.postRepository.save(tip);
      }
    }
  }

  private calculateProfit(tip: Post, result: TipResult): number {
    if (!tip.stake || !tip.odds) return 0;

    switch (result) {
      case TipResult.WON:
        return tip.stake * tip.odds - tip.stake;
      case TipResult.HALF_WON:
        return (tip.stake * tip.odds - tip.stake) / 2;
      case TipResult.LOST:
        return -tip.stake;
      case TipResult.HALF_LOST:
        return -tip.stake / 2;
      case TipResult.VOID:
        return 0;
      default:
        return 0;
    }
  }

  private async calculateStreaks(
    userId: string,
  ): Promise<{ currentStreak: number; bestStreak: number }> {
    const recentTips = await this.postRepository.find({
      where: {
        author_id: userId,
        type: PostType.TIP,
      },
      order: { tip_resolved_at: 'DESC' },
      take: 100, // Look at last 100 tips for streak calculation
    });

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (const tip of recentTips) {
      if (tip.tip_result === TipResult.WON) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
      } else if (tip.tip_result === TipResult.LOST) {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
        if (currentStreak > 0) currentStreak = 0;
      }
    }

    bestStreak = Math.max(bestStreak, tempStreak);

    return { currentStreak: Math.abs(currentStreak), bestStreak };
  }

  private async updateUserTipStats(
    userId: string,
    result: TipResult,
    profit: number,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) return;

    // Update basic counters
    user.total_tips = (user.total_tips || 0) + 1;

    if (result === TipResult.WON) {
      user.successful_tips = (user.successful_tips || 0) + 1;
    }

    // Update profit
    user.total_profit = (user.total_profit || 0) + profit;

    // Recalculate success rate
    const totalCompleted = await this.postRepository.count({
      where: {
        author_id: userId,
        type: PostType.TIP,
        tip_result: In([TipResult.WON, TipResult.LOST]),
      },
    });

    if (totalCompleted > 0) {
      user.tip_success_rate = (user.successful_tips / totalCompleted) * 100;
    }

    await this.userRepository.save(user);
  }

  private getBadgeForRank(rank: number): string | undefined {
    switch (rank) {
      case 1:
        return '🥇 Champion';
      case 2:
        return '🥈 Expert';
      case 3:
        return '🥉 Pro';
      default:
        if (rank <= 10) return '⭐ Elite';
        if (rank <= 25) return '🔥 Rising';
        return undefined;
    }
  }
}
