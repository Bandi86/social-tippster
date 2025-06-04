import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostType, TipResult } from '../posts/entities/posts.entity';
import { PostsService } from '../posts/posts.service';
import { User } from '../users/entities/user.entity';
import { CreateTipDto } from './dto/create-tip.dto';
import { LeaderboardEntryDto, SetTipResultDto, UserTipStatsDto } from './dto/tip-result.dto';
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
export class TippsService {
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
    const validationResult = await this.validateTip(createTipDto);
    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Tip validation failed',
        errors: validationResult.errors,
      });
    }
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
    tip.tip_result = setResultDto.result;
    tip.is_result_set = true;
    tip.tip_resolved_at = new Date();
    if (setResultDto.profit !== undefined) {
      tip.tip_profit = setResultDto.profit;
    } else {
      tip.tip_profit = this.calculateProfit(tip, setResultDto.result);
    }
    const updatedTip = await this.postRepository.save(tip);
    await this.updateUserTipStats(userId, setResultDto.result, tip.tip_profit);
    return updatedTip;
  }

  async validateTip(createTipDto: CreateTipDto): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const { matchDate, odds, matchId, matchName, outcome, stake, submissionDeadline } =
      createTipDto;
    const now = new Date();
    if (!this.tipValidationService.validateSubmissionDeadline(new Date(matchDate), now)) {
      errors.push('A tipp leadási határideje lejárt.');
    }
    if (!this.tipValidationService.validateOdds(odds)) {
      errors.push('Az odds értéke érvénytelen.');
    }
    if (matchId || matchName) {
      const bettingSlipData = {
        matchDate: new Date(matchDate),
        team1: matchName?.split(' vs ')[0] || matchName?.split(' - ')[0] || '',
        team2: matchName?.split(' vs ')[1] || matchName?.split(' - ')[1] || '',
        outcome,
        odds,
        stake,
        submissionTime: submissionDeadline ? new Date(submissionDeadline) : new Date(),
      };
      const matchValidation = await this.tipValidationService.validateMatchExists(bettingSlipData);
      if (!matchValidation.isValid) {
        errors.push('A megadott meccs nem létezik.');
      }
    }
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
      .innerJoin(User, 'user', 'user.user_id = post.author_id')
      .where('post.type = :type', { type: PostType.TIP })
      .andWhere('post.is_result_set = :isResultSet', { isResultSet: true })
      .groupBy('post.author_id, user.username')
      .orderBy('SUM(COALESCE(tip_profit, 0))', 'DESC')
      .setParameters({
        won: TipResult.WON,
        lost: TipResult.LOST,
      })
      .limit(limit)
      .getRawMany();
    return leaderboardData.map((data: LeaderboardRaw, idx: number) => {
      const totalResolved = parseInt(data.wonTips) + parseInt(data.lostTips);
      const winRate = totalResolved > 0 ? (parseInt(data.wonTips) / totalResolved) * 100 : 0;
      return {
        userId: data.userId,
        username: data.username,
        totalTips: parseInt(data.totalTips),
        wonTips: parseInt(data.wonTips),
        lostTips: parseInt(data.lostTips),
        winRate: Math.round(winRate * 100) / 100,
        totalProfit: parseFloat(data.totalProfit) || 0,
        rank: idx + 1,
      };
    });
  }

  async checkDeadlines(): Promise<void> {
    const now = new Date();
    // Use query builder to get expired tip IDs
    const expiredTipIds = await this.postRepository
      .createQueryBuilder('post')
      .select('post.id')
      .where('post.submission_deadline < :now', { now })
      .andWhere('post.type = :type', { type: PostType.TIP })
      .andWhere('post.tip_result = :pending', { pending: TipResult.PENDING })
      .getRawMany();
    const ids = Array.isArray(expiredTipIds)
      ? expiredTipIds.map((row: { id: string }) => row.id)
      : [];
    if (ids.length > 0) {
      const tips = await this.postRepository.findByIds(ids);
      for (const tip of tips) {
        tip.is_valid_tip = false;
        if (!Array.isArray(tip.validation_errors)) tip.validation_errors = [];
        tip.validation_errors.push('Submission deadline expired');
        await this.postRepository.save(tip);
      }
    }
  }

  async getTipById(id: string): Promise<Post> {
    const tip = await this.postRepository.findOne({ where: { id, type: PostType.TIP } });
    if (!tip) {
      throw new NotFoundException('Tip not found');
    }
    return tip;
  }

  private async calculateStreaks(
    userId: string,
  ): Promise<{ currentStreak: number; bestStreak: number }> {
    const tips = await this.postRepository.find({
      where: {
        author_id: userId,
        type: PostType.TIP,
        is_result_set: true,
      },
      order: { tip_resolved_at: 'DESC' },
    });

    let currentStreak = 0;
    let bestStreak = 0;
    let currentStreakType: TipResult | null = null;

    for (const tip of tips) {
      if (tip.tip_result !== TipResult.PENDING) {
        if (currentStreakType === null) {
          // First tip in the sequence
          currentStreakType = tip.tip_result;
          currentStreak = 1;
        } else if (currentStreakType === tip.tip_result) {
          // Continuing the streak
          currentStreak++;
        } else {
          // Streak broken
          if (currentStreakType === TipResult.WON && currentStreak > bestStreak) {
            bestStreak = currentStreak;
          }
          currentStreakType = tip.tip_result;
          currentStreak = 1;
        }
      }
    }

    // Check if the final streak is the best (for winning streaks only)
    if (currentStreakType === TipResult.WON && currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    // Current streak is only counted if it's a winning streak
    return {
      currentStreak: currentStreakType === TipResult.WON ? currentStreak : 0,
      bestStreak,
    };
  }

  private calculateProfit(tip: Post, result: TipResult): number {
    if (result === TipResult.WON) {
      // Calculate profit: (odds * stake) - stake
      return (tip.odds || 0) * (tip.stake || 0) - (tip.stake || 0);
    } else if (result === TipResult.LOST) {
      // Loss equals negative stake
      return -(tip.stake || 0);
    }
    return 0;
  }

  private async updateUserTipStats(
    userId: string,
    result: TipResult,
    profit: number,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) return;
    // Use available fields for stats
    if (result === TipResult.WON) {
      user.successful_tips = (user.successful_tips || 0) + 1;
    }
    user.total_tips = (user.total_tips || 0) + 1;
    user.total_profit = (user.total_profit || 0) + profit;
    await this.userRepository.save(user);
  }
}
