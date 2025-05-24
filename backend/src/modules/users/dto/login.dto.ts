import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Érvényes email címet adj meg' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A jelszó legalább 6 karakter hosszú' })
  password: string;
}
