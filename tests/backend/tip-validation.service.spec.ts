import { TipValidationService } from '../../../backend/src/modules/posts/tip-validation.service';

describe('TipValidationService', () => {
  let service: TipValidationService;

  beforeEach(() => {
    service = new TipValidationService();
  });

  it('should validate submission deadline (future date)', () => {
    const matchDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in future
    const now = new Date();
    expect(service.validateSubmissionDeadline(matchDate, now)).toBe(true);
  });

  it('should invalidate submission deadline (past date)', () => {
    const matchDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour in past
    const now = new Date();
    expect(service.validateSubmissionDeadline(matchDate, now)).toBe(false);
  });

  it('should validate odds in range', () => {
    expect(service.validateOdds(1.5)).toBe(true);
    expect(service.validateOdds(100)).toBe(true);
    expect(service.validateOdds(1.01)).toBe(true);
  });

  it('should invalidate odds out of range', () => {
    expect(service.validateOdds(1)).toBe(false);
    expect(service.validateOdds(100.1)).toBe(false);
  });

  it('should always return true for checkUserPreviousTips (stub)', () => {
    expect(service.checkUserPreviousTips('user', new Date())).toBe(true);
  });

  it('should always return true for validateMatchExists (stub)', () => {
    expect(service.validateMatchExists('match')).toBe(true);
  });
});
