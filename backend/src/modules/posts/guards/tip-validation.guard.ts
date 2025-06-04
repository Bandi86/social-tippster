import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CreateTipDto } from '../dto/create-tip.dto';
import { TipValidationService } from '../tip-validation.service';

@Injectable()
export class TipValidationGuard implements CanActivate {
  constructor(private readonly tipValidationService: TipValidationService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: { body: CreateTipDto } = context.switchToHttp().getRequest();
    const tipData: CreateTipDto = request.body;

    // Only validate if this is a tip post (we'll check if required fields exist)
    if (!tipData.odds || !tipData.stake || !tipData.confidence) {
      // This is not a tip, so skip validation
      return true;
    }

    const validationErrors: string[] = [];

    // Validate required tip fields
    if (!tipData.odds || !tipData.stake || !tipData.confidence) {
      validationErrors.push('Tipp esetén odds, stake és confidence mezők kötelezőek');
    }

    // Validate odds range
    if (tipData.odds && !this.tipValidationService.validateOdds(tipData.odds)) {
      validationErrors.push('Az odds értéke 1.01 és 100 között kell legyen');
    }

    // Validate stake range (1-1000)
    if (tipData.stake && (tipData.stake < 1 || tipData.stake > 1000)) {
      validationErrors.push('A tét értéke 1 és 1000 között kell legyen');
    }

    // Validate confidence range (1-5)
    if (tipData.confidence && (tipData.confidence < 1 || tipData.confidence > 5)) {
      validationErrors.push('A bizalom értéke 1 és 5 között kell legyen');
    }

    // Validate submission deadline if match date is provided
    if (tipData.matchDate) {
      const matchDate = new Date(tipData.matchDate);
      const now = new Date();

      if (!this.tipValidationService.validateSubmissionDeadline(matchDate, now)) {
        validationErrors.push('A meccs már elkezdődött, nem lehet több tippet beküldeni');
      }
    }

    // Validate betting market (outcome is required)
    if (tipData.outcome && tipData.outcome.trim().length === 0) {
      validationErrors.push('A fogadási outcome megadása kötelező tipp esetén');
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Tipp validálási hibák',
        errors: validationErrors,
      });
    }

    return true;
  }
}
