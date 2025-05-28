import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      total: { type: 'number', description: 'Total number of users' },
      page: { type: 'number', description: 'Current page number' },
      limit: { type: 'number', description: 'Number of items per page' },
      totalPages: { type: 'number', description: 'Total number of pages' },
      hasNextPage: { type: 'boolean', description: 'Is there a next page?' },
      hasPreviousPage: { type: 'boolean', description: 'Is there a previous page?' },
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
