import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class GetUsersQueryDto {
  @ApiProperty({ description: 'Oldal száma', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Elemek száma oldalanként', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: 'Keresési kifejezés', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Státusz szűrő',
    required: false,
    enum: ['all', 'active', 'banned', 'unverified'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'active', 'banned', 'unverified'])
  status?: string;

  @ApiProperty({
    description: 'Szerepkör szűrő',
    required: false,
    enum: UserRole,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(UserRole))
  role?: UserRole;

  @ApiProperty({
    description: 'Rendezési mód',
    required: false,
    enum: ['newest', 'oldest', 'username'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['newest', 'oldest', 'username'])
  sortBy?: string;
}
