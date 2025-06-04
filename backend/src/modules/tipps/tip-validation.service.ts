import { Injectable, Logger } from '@nestjs/common';
import { BettingSlipData } from '../image-analysis/image-processing.service';

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
  async validateTip(tipData: BettingSlipData): Promise<TipValidationResult> {
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
      const historyCheck = await this.checkUserPreviousTips();
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

    // Team name checks
    if (tipData.team1 && tipData.team1.length < 2) {
      warnings.push('Team 1 name seems too short - please verify');
    }
    if (tipData.team2 && tipData.team2.length < 2) {
      warnings.push('Team 2 name seems too short - please verify');
    }

    return { errors, warnings };
  }

  /**
   * Validate if the tip submission deadline is valid
   */
  validateSubmissionDeadline(matchDate: Date, currentTime: Date): boolean {
    // Add a small grace period (e.g., 5 minutes)
    const gracePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
    return matchDate.getTime() > currentTime.getTime() - gracePeriod;
  }

  /**
   * Validate odds are within valid range
   */
  validateOdds(odds: number): boolean {
    return odds >= 1.01 && odds <= 100;
  }

  /**
   * Validate stake is positive
   */
  validateStake(stake: number): boolean {
    return stake > 0;
  }

  /**
   * Check user's previous tips to prevent duplicates
   */
  async checkUserPreviousTips(): Promise<TipValidationResult> {
    // Artificial await to satisfy async/await linting
    await Promise.resolve();
    // This would check for:
    // - Similar tips (same match, same outcome) within a short time
    // - Duplicate submissions
    // - Conflicting tips (same match, different outcomes)
    // Would require repository access

    // For now, return a simple mock result
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Validate if the match exists in external data
   */
  async validateMatchExists(tipData: BettingSlipData): Promise<TipValidationResult> {
    // This would call an external API or check a database
    // for the match details to verify it exists

    // Artificial await to satisfy async/await linting
    await Promise.resolve();

    // For now, return a simple mock result
    const isValid = !!(tipData.team1 && tipData.team2 && tipData.matchDate);

    return {
      isValid,
      errors: isValid ? [] : ['Match could not be verified'],
      warnings: [],
    };
  }

  /**
   * Assess the risk level of a tip
   */
  private assessTipRisk(tipData: BettingSlipData): string[] {
    const warnings: string[] = [];

    // High odds warning
    if (tipData.odds && tipData.odds > 10) {
      warnings.push('High odds detected - success probability may be low');
    }

    // High stake warning
    if (tipData.stake && tipData.stake > 1000) {
      warnings.push('High stake detected - consider reducing your risk');
    }

    // Early submission warning
    if (tipData.matchDate && tipData.submissionTime) {
      const timeDiff = tipData.matchDate.getTime() - tipData.submissionTime.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        warnings.push('Match is far in the future - conditions may change before the event');
      }
    }

    return warnings;
  }
}
