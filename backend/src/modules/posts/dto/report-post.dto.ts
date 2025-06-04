import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportReason } from '../entities/post-report.entity';

export class ReportPostDto {
  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  additional_details?: string;
}

export class ReportPostResponseDto {
  success: boolean;
  reportId: string;
}
