import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Érvényes email címet adj meg' })
  email: string;
}
