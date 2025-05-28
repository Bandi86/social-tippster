import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class ChangeUserRoleDto {
  @ApiProperty({
    description: 'New role for the user',
    enum: UserRole,
    example: UserRole.MODERATOR,
  })
  @IsEnum(UserRole, { message: 'Valid role must be provided' })
  role: UserRole;
}
