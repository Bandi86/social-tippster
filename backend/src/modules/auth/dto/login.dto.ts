import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Felhasználó email címe',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Érvényes email címet adjon meg' })
  @IsNotEmpty({ message: 'Az email cím megadása kötelező' })
  email: string;

  @ApiProperty({
    description: 'Felhasználó jelszava',
    example: 'mySecurePassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'A jelszó megadása kötelező' })
  @MinLength(6, { message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie' })
  password: string;
}
