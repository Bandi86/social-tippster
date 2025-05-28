import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListCommentsQueryDto {
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
    enum: ['all', 'flagged', 'reported', 'active'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'flagged', 'reported', 'active'])
  status?: string;

  @ApiProperty({ description: 'Bejegyzés ID szűrő', required: false })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiProperty({ description: 'Szerző ID szűrő', required: false })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiProperty({
    description: 'Rendezési mód',
    required: false,
    enum: ['newest', 'oldest', 'most_reported'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['newest', 'oldest', 'most_reported'])
  sortBy?: string;
}
