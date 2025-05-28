import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning the user',
    example: 'Violation of community guidelines',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
