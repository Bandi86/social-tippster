import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Az új jelszó legalább 6 karakter hosszú legyen' })
  newPassword: string;

  @IsString()
  @MinLength(6, { message: 'A jelszó megerősítés legalább 6 karakter hosszú' })
  confirmPassword: string;
}
