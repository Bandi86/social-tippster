import { Injectable } from '@nestjs/common';

@Injectable()
export class TipValidationService {
  // Deadline validation
  validateSubmissionDeadline(matchDate: Date, submissionTime: Date): boolean {
    return submissionTime.getTime() < matchDate.getTime();
  }

  // User history validation
  checkUserPreviousTips(/* userId: string, matchDate: Date */): boolean {
    // TODO: implement real check
    return true;
  }

  // Odds validation
  validateOdds(odds: number): boolean {
    return odds >= 1.01 && odds <= 100;
  }

  // Match validation
  validateMatchExists(/* matchId: string */): boolean {
    // TODO: implement real match check
    return true;
  }
}
