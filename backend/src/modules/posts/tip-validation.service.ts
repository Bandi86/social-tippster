import { Injectable, Logger } from '@nestjs/common';
import { BettingSlipData } from '../uploads/image-processing.service';

export interface TipValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MatchData {
  id: string;
  team1: string;
  team2: string;
  startTime: Date;
  status: 'upcoming' | 'live' | 'finished';
  league?: string;
}

@Injectable()
export class TipValidationService {
  private readonly logger = new Logger(TipValidationService.name);

  /**
   * Comprehensive tip validation
   */
  async validateTip(tipData: BettingSlipData, userId: string): Promise<TipValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic data validation
      const basicValidation = this.validateBasicData(tipData);
      errors.push(...basicValidation.errors);
      warnings.push(...basicValidation.warnings);

      // Deadline validation
      if (tipData.matchDate && tipData.submissionTime) {
        if (!this.validateSubmissionDeadline(tipData.matchDate, tipData.submissionTime)) {
          errors.push('Tip submitted after match start time');
        }
      }

      // Odds validation
      if (tipData.odds && !this.validateOdds(tipData.odds)) {
        errors.push('Invalid odds value (must be between 1.01 and 100)');
      }

      // Stake validation
      if (tipData.stake && !this.validateStake(tipData.stake)) {
        errors.push('Invalid stake amount (must be positive)');
      }

      // User history validation
      const historyCheck = await this.checkUserPreviousTips(userId, tipData);
      if (!historyCheck.isValid) {
        warnings.push(...historyCheck.warnings);
        errors.push(...historyCheck.errors);
      }

      // Match existence validation
      if (tipData.team1 && tipData.team2 && tipData.matchDate) {
        const matchValidation = await this.validateMatchExists(tipData);
        if (!matchValidation.isValid) {
          warnings.push('Could not verify match details - please check manually');
        }
      }

      // Risk assessment
      const riskAssessment = this.assessTipRisk(tipData);
      warnings.push(...riskAssessment);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error('Error validating tip:', error);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate basic tip data
   */
  private validateBasicData(tipData: BettingSlipData): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields check
    if (!tipData.odds && !tipData.stake) {
      errors.push('Either odds or stake must be provided');
    }

    // Date consistency checks
    if (tipData.submissionTime && tipData.validityTime) {
      if (tipData.submissionTime >= tipData.validityTime) {
        errors.push('Submission time must be before validity time');
      }
    }

    if (tipData.matchDate && tipData.matchDate < new Date()) {
      warnings.push('Match date appears to be in the past');
    }

    // Team data validation
    if (tipData.team1 && tipData.team2) {
      if (tipData.team1.toLowerCase() === tipData.team2.toLowerCase()) {
        errors.push('Team names cannot be identical');
      }
    }

    // Financial data validation
    if (tipData.stake && tipData.totalBet && tipData.stake > tipData.totalBet) {
      warnings.push('Individual stake is higher than total bet amount');
    }

    if (tipData.odds && tipData.stake && tipData.maxWinning) {
      const expectedWinning = tipData.odds * tipData.stake;
      if (Math.abs(expectedWinning - tipData.maxWinning) > expectedWinning * 0.1) {
        warnings.push('Maximum winning amount does not match calculated value');
      }
    }

    return { errors, warnings };
  }

  /**
   * Deadline validation
   */
  validateSubmissionDeadline(matchDate: Date, submissionTime: Date): boolean {
    return submissionTime.getTime() < matchDate.getTime();
  }

  /**
   * User history validation with enhanced checks
   */
  async checkUserPreviousTips(
    userId: string,
    tipData: BettingSlipData,
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // This method is async for future database integration.
      // Remove this dummy await when real async logic is added.
      await Promise.resolve();

      // TODO: Implement real database checks
      // For now, return basic validation

      // Check for duplicate tips (same match, same outcome)
      if (tipData.team1 && tipData.team2 && tipData.matchDate) {
        // TODO: Query database for existing tips
        // const existingTips = await this.tipRepository.findUserTipsForMatch(userId, matchData);
        // if (existingTips.length > 0) {
        //   warnings.push('You have already placed a tip for this match');
        // }
      }

      // Check daily/weekly limits
      // TODO: Implement spending limits
      // const dailySpent = await this.calculateUserDailySpending(userId);
      // if (tipData.stake && dailySpent + tipData.stake > DAILY_LIMIT) {
      //   errors.push('Daily spending limit exceeded');
      // }

      return {
        isValid: true,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error('Error checking user previous tips:', error);
      return {
        isValid: false,
        errors: ['Could not verify user tip history'],
        warnings: [],
      };
    }
  }

  /**
   * Odds validation with enhanced checks
   */
  validateOdds(odds: number): boolean {
    return odds >= 1.01 && odds <= 100 && !isNaN(odds) && isFinite(odds);
  }

  /**
   * Stake validation
   */
  validateStake(stake: number): boolean {
    return stake > 0 && !isNaN(stake) && isFinite(stake) && stake <= 1000000; // Max stake limit
  }

  /**
   * Match validation with external API integration (placeholder)
   */
  async validateMatchExists(
    tipData: BettingSlipData,
  ): Promise<{ isValid: boolean; match?: MatchData }> {
    // Dummy await to satisfy async requirement until real async logic is added
    await Promise.resolve();

    try {
      // TODO: Integrate with real sports API
      // Examples: API-Football, SportRadar, etc.

      // For now, return basic validation based on data completeness
      if (tipData.team1 && tipData.team2 && tipData.matchDate) {
        // Mock match data
        const mockMatch: MatchData = {
          id: 'mock-' + Date.now(),
          team1: tipData.team1,
          team2: tipData.team2,
          startTime: tipData.matchDate,
          status: tipData.matchDate > new Date() ? 'upcoming' : 'finished',
        };

        return {
          isValid: true,
          match: mockMatch,
        };
      }

      return { isValid: false };
    } catch (error) {
      this.logger.error('Error validating match:', error);
      return { isValid: false };
    }
  }

  /**
   * Risk assessment for tips
   */
  private assessTipRisk(tipData: BettingSlipData): string[] {
    const warnings: string[] = [];

    // High odds risk
    if (tipData.odds && tipData.odds > 10) {
      warnings.push('High risk tip - odds above 10.0');
    }

    // High stake risk
    if (tipData.stake && tipData.stake > 1000) {
      warnings.push('High stake amount detected');
    }

    // Combination bet risk
    if (tipData.combinations && tipData.combinations.includes('/')) {
      warnings.push('System bet detected - higher complexity');
    }

    // Time proximity risk
    if (tipData.matchDate && tipData.submissionTime) {
      const timeDiff = tipData.matchDate.getTime() - tipData.submissionTime.getTime();
      if (timeDiff < 30 * 60 * 1000) {
        // Less than 30 minutes
        warnings.push('Tip submitted very close to match start');
      }
    }

    return warnings;
  }

  /**
   * Calculate tip potential return
   */
  calculatePotentialReturn(stake: number, odds: number): number {
    return stake * odds;
  }

  /**
   * Validate tip result (for completed matches)
   */
  async validateTipResult(result: 'win' | 'loss' | 'void'): Promise<boolean> {
    // Dummy await to satisfy async requirement until real async logic is added
    await Promise.resolve();
    try {
      // TODO: Integrate with match result API
      // Validate that the tip result matches actual match outcome
      // 'result' will be used here in future implementation
      void result; // Prevent unused variable warning
      return true;
    } catch (error) {
      this.logger.error('Error validating tip result:', error);
      return false;
    }
  }
}
