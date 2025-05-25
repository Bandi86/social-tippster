import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListCommentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter comments by post ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  postId?: string;

  @ApiPropertyOptional({
    description: 'Megjegyzések szűrése szülő megjegyzés azonosítója szerint (a válaszokhoz)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiPropertyOptional({
    description: 'Elemek száma oldalanként',
    default: 10,
    example: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Oldalszám (1-től kezdődik)',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Mező amely szerint rendezni szeretnénk',
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Rendezés sorrendje',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
