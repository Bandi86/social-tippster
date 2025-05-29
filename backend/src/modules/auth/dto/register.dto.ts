import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Egyedi felhasználónév',
    example: 'johndoe123',
    minLength: 3,
  })
  @IsNotEmpty({ message: 'A felhasználónév megadása kötelező' })
  @IsString({ message: 'A felhasználónév szöveges értéknek kell lennie' })
  @MinLength(3, { message: 'A felhasználónévnek legalább 3 karakter hosszúnak kell lennie' })
  username: string;

  @ApiProperty({
    description: 'Email cím',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Érvényes email címet adjon meg' })
  @IsNotEmpty({ message: 'Az email cím megadása kötelező' })
  email: string;

  @ApiProperty({
    description: 'Jelszó',
    example: 'mySecurePassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'A jelszó megadása kötelező' })
  @MinLength(6, { message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie' })
  password: string;

  @ApiPropertyOptional({
    description: 'Keresztnév',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Vezetéknév',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Idézőjel',
    example: 'GMT+1',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Nyelvi preferencia',
    example: 'hu-HU',
  })
  @IsOptional()
  @IsString()
  language_preference?: string;
}
