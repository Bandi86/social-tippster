import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({ description: 'Felhasználók listája', type: [UserResponseDto] })
  users: UserResponseDto[];

  @ApiProperty({ description: 'Metaadatok' })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
