import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'New access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;
}

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token to revoke',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout success message',
    example: 'Sikeres kijelentkezés',
  })
  message: string;
}

export class LogoutAllDevicesDto {
  @ApiProperty({
    description: 'Logout success message',
    example: 'Sikeres kijelentkezés minden eszközről',
  })
  message: string;

  @ApiProperty({
    description: 'Number of devices logged out',
    example: 3,
  })
  devices_logged_out: number;
}
