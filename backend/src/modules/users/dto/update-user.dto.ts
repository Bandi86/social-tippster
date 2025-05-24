import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // A PartialType automatikusan minden mezőt opcionálissá tesz a CreateUserDto-ból
}
