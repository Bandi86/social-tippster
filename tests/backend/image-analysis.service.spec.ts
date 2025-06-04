import {
  BettingSlipData,
  ImageAnalysisService,
  MatchData,
} from '../../../backend/src/modules/image-analysis/image-analysis.service';
import { OcrService } from '../../../backend/src/modules/image-analysis/ocr.service';
import { TipDataParserService } from '../../../backend/src/modules/image-analysis/tip-data-parser.service';
import { CreateTipDto } from '../../../backend/src/modules/posts/dto/create-tip.dto';

describe('ImageAnalysisService', () => {
  let service: ImageAnalysisService;
  let ocrService: OcrService;
  let parserService: TipDataParserService;

  beforeEach(() => {
    ocrService = {
      extractTextFromImage: jest.fn(
        async img => 'MATCH: Team A vs Team B\nDATE: 2025-06-10\nODDS: 2.5\nSTAKE: 5\nOUTCOME: 1',
      ),
    } as any;
    parserService = {
      parseTipData: jest.fn(async text => ({
        matchName: 'Team A vs Team B',
        matchDate: '2025-06-10',
        matchTime: '20:00',
        tipCategory: 'single_bet',
        odds: 2.5,
        stake: 5,
        outcome: '1',
        confidence: 4,
        rawText: text,
        extractedEntities: [],
        confidence_score: 0.95,
      })),
    } as any;
    service = new ImageAnalysisService(null as any, ocrService, parserService);
  });

  it('should extract match data from image', async () => {
    const result: MatchData = await service.extractMatchDataFromImage('fakepath.png');
    expect(result).toEqual({
      matchName: 'Team A vs Team B',
      matchDate: '2025-06-10',
      matchTime: '20:00',
    });
  });

  it('should recognize text from betting slip', async () => {
    const result: BettingSlipData = await service.recognizeTextFromBettingSlip('fakepath.png');
    expect(result.odds).toBe(2.5);
    expect(result.stake).toBe(5);
    expect(result.outcome).toBe('1');
    expect(result.tipCategory).toBe('single_bet');
    expect(result.confidence).toBe(4);
    expect(result.extractedText).toContain('MATCH: Team A vs Team B');
  });

  it('should auto fill tip from image', async () => {
    const result: CreateTipDto = await service.autoFillTipFromImage('fakepath.png');
    expect(result.title).toContain('Team A vs Team B');
    expect(result.tipCategory).toBe('single_bet');
    expect(result.matchName).toBe('Team A vs Team B');
    expect(result.matchDate).toBe('2025-06-10');
    expect(result.odds).toBe(2.5);
    expect(result.stake).toBe(5);
    expect(result.outcome).toBe('1');
    expect(result.confidence).toBe(4);
  });

  it('should throw error if required data is missing', async () => {
    (parserService.parseTipData as jest.Mock).mockResolvedValueOnce({});
    await expect(service.extractMatchDataFromImage('fakepath.png')).rejects.toThrow();
    await expect(service.autoFillTipFromImage('fakepath.png')).rejects.toThrow();
  });
});
