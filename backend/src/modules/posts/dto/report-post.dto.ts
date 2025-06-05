import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportReason } from '../entities/post-report.entity';

export class ReportPostDTO {
  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  additional_details?: string;
}

export class ReportPostResponseDTO {
  success: boolean;
  reportId: string;
}
