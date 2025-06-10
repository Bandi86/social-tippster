import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class McpRequestDto {
  @ApiProperty()
  @IsString()
  method: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  params?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;
}

export class McpResponseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  result?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  error?: {
    code: number;
    message: string;
    data?: any;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;
}

export class McpCapabilityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  config?: any;
}

export class McpServerInfoDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  version: string;

  @ApiProperty({ type: [McpCapabilityDto] })
  @IsArray()
  capabilities: McpCapabilityDto[];

  @ApiProperty()
  @IsString()
  protocolVersion: string;

  @ApiProperty()
  @IsString()
  timestamp: string;
}
