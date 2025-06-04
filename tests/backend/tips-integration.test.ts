import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTipDto } from '../../backend/src/modules/posts/dto/create-tip.dto';
import { TipCategory, TipResult } from '../../backend/src/modules/posts/entities/posts.entity';
import { PostsService } from '../../backend/src/modules/posts/posts.service';
import { TipsController } from '../../backend/src/modules/posts/tips.controller';
import { TipsService } from '../../backend/src/modules/posts/tips.service';

describe('Tips Integration Tests', () => {
  let app: INestApplication;
  let tipsService: TipsService;

  const mockUser = {
    user_id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockTipsService = {
    createTip: jest.fn(),
    validateTip: jest.fn(),
    setTipResult: jest.fn(),
    getUserTipStats: jest.fn(),
    getLeaderboard: jest.fn(),
    checkDeadlines: jest.fn(),
  };

  const mockPostsService = {
    findAllPosts: jest.fn(),
    findPostById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipsController],
      providers: [
        {
          provide: TipsService,
          useValue: mockTipsService,
        },
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    tipsService = module.get<TipsService>(TipsService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Tip Validation', () => {
    it('should validate a valid tip', () => {
      const validTip: CreateTipDto = {
        title: 'Test Tip',
        content: 'This is a test tip',
        odds: 2.5,
        stake: 2,
        tipCategory: TipCategory.SINGLE_BET,
        matchName: 'Team A vs Team B',
        matchDate: '2025-06-05',
        matchTime: '20:00',
        outcome: '1',
        submissionDeadline: '2025-06-05T18:00:00',
      };

      mockTipsService.validateTip.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      const result = tipsService.validateTip(validTip);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate tip with low odds', () => {
      const invalidTip: CreateTipDto = {
        title: 'Test Tip',
        content: 'This is a test tip',
        odds: 0.5, // Invalid - too low
        stake: 2,
        tipCategory: TipCategory.SINGLE_BET,
        matchName: 'Team A vs Team B',
        matchDate: '2025-06-05',
        matchTime: '20:00',
        outcome: '1',
        submissionDeadline: '2025-06-05T18:00:00',
      };

      mockTipsService.validateTip.mockReturnValue({
        isValid: false,
        errors: ['Odds must be at least 1.01'],
        warnings: [],
      });

      const result = tipsService.validateTip(invalidTip);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Odds must be at least 1.01');
    });
  });

  describe('Tip Statistics', () => {
    it('should return user tip statistics', async () => {
      const mockStats = {
        totalTips: 10,
        wonTips: 6,
        lostTips: 3,
        pendingTips: 1,
        winRate: 66.67,
        totalProfit: 15.5,
        averageOdds: 2.1,
        currentStreak: 3,
        bestStreak: 5,
      };

      mockTipsService.getUserTipStats.mockResolvedValue(mockStats);

      const stats = await tipsService.getUserTipStats('test-user-id');
      expect(stats.totalTips).toBe(10);
      expect(stats.winRate).toBe(66.67);
      expect(stats.totalProfit).toBe(15.5);
    });
  });

  describe('Leaderboard', () => {
    it('should return leaderboard entries', async () => {
      const mockLeaderboard = [
        {
          userId: 'user1',
          username: 'topuser',
          totalTips: 20,
          winRate: 80,
          totalProfit: 50.0,
          rank: 1,
          badge: '🥇 Champion',
        },
        {
          userId: 'user2',
          username: 'gooduser',
          totalTips: 15,
          winRate: 75,
          totalProfit: 35.0,
          rank: 2,
          badge: '🥈 Expert',
        },
      ];

      mockTipsService.getLeaderboard.mockResolvedValue(mockLeaderboard);

      const leaderboard = await tipsService.getLeaderboard(10);
      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].badge).toBe('🥇 Champion');
      expect(leaderboard[1].rank).toBe(2);
    });
  });

  describe('Tip Result Management', () => {
    it('should set tip result successfully', async () => {
      const mockTip = {
        id: 'tip-id',
        author_id: 'test-user-id',
        title: 'Test Tip',
        tip_result: TipResult.WON,
        is_result_set: true,
        tip_profit: 5.0,
      };

      mockTipsService.setTipResult.mockResolvedValue(mockTip);

      const result = await tipsService.setTipResult(
        'tip-id',
        { result: TipResult.WON, profit: 5.0 },
        'test-user-id',
      );

      expect(result.tip_result).toBe(TipResult.WON);
      expect(result.is_result_set).toBe(true);
      expect(result.tip_profit).toBe(5.0);
    });
  });
});
