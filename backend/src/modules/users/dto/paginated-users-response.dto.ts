import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersResponseDto {
  data: UserResponseDto[];

  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(users: UserResponseDto[], total: number, page: number, limit: number) {
    this.data = users;

    const totalPages = Math.ceil(total / limit);

    this.meta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
