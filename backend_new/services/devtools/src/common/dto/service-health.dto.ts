import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ServiceHealthDto {
  @ApiProperty()
  @IsString()
  serviceName: string;

  @ApiProperty()
  @IsString()
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';

  @ApiProperty()
  @IsNumber()
  responseTime: number;

  @ApiProperty()
  @IsString()
  version: string;

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  details?: any;
}

export class HealthCheckResponseDto {
  @ApiProperty()
  @IsString()
  overallStatus: 'healthy' | 'unhealthy' | 'degraded';

  @ApiProperty({ type: [ServiceHealthDto] })
  @IsArray()
  services: ServiceHealthDto[];

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty()
  @IsNumber()
  totalServices: number;

  @ApiProperty()
  @IsNumber()
  healthyServices: number;

  @ApiProperty()
  @IsNumber()
  unhealthyServices: number;
}
