import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'A felhasználónév legalább 3 karakter hosszú legyen' })
  username: string;

  @IsEmail({}, { message: 'Érvényes email címet adj meg' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A jelszó legalább 6 karakter hosszú legyen' })
  password: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsPhoneNumber('HU', { message: 'Érvényes magyar telefonszámot adj meg' })
  phone_number?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Érvényes dátumot adj meg (YYYY-MM-DD)' })
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Érvényes nemet válassz' })
  gender?: Gender;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  referral_code?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language_preference?: string;
}
