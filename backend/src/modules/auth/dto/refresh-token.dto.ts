export class RefreshTokenDto {
  access_token: string;
}

export class LogoutDto {
  message: string;
}

export class LogoutAllDevicesDto {
  message: string;
  devices_logged_out: number;
}
