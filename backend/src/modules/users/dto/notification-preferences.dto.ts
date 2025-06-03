import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';

// Define types locally to avoid circular dependencies
export type NotificationChannel = 'in_app' | 'email' | 'push';
export type NotificationType = 'comment' | 'mention' | 'follow';

export class ChannelSettingsDto {
  @ApiProperty({
    description: 'Enable in-app notifications',
    example: true,
  })
  @IsBoolean()
  in_app: boolean;

  @ApiProperty({
    description: 'Enable email notifications',
    example: false,
  })
  @IsBoolean()
  email: boolean;

  @ApiProperty({
    description: 'Enable push notifications',
    example: false,
  })
  @IsBoolean()
  push: boolean;
}

export class NotificationTypeSettingsDto {
  @ApiProperty({
    description: 'Comment notification settings',
    type: ChannelSettingsDto,
  })
  @ValidateNested()
  @Type(() => ChannelSettingsDto)
  comment: ChannelSettingsDto;

  @ApiProperty({
    description: 'Mention notification settings',
    type: ChannelSettingsDto,
  })
  @ValidateNested()
  @Type(() => ChannelSettingsDto)
  mention: ChannelSettingsDto;

  @ApiProperty({
    description: 'Follow notification settings',
    type: ChannelSettingsDto,
  })
  @ValidateNested()
  @Type(() => ChannelSettingsDto)
  follow: ChannelSettingsDto;
}

export class NotificationPreferencesDto {
  @ApiProperty({
    description: 'Notification preferences organized by type and channel',
    type: NotificationTypeSettingsDto,
  })
  @ValidateNested()
  @Type(() => NotificationTypeSettingsDto)
  notification_preferences: NotificationTypeSettingsDto;
}

export class UpdateChannelSettingsDto {
  @ApiProperty({
    description: 'Enable in-app notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  in_app?: boolean;

  @ApiProperty({
    description: 'Enable email notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiProperty({
    description: 'Enable push notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  push?: boolean;
}

export class UpdateNotificationTypeSettingsDto {
  @ApiProperty({
    description: 'Comment notification settings (partial)',
    type: UpdateChannelSettingsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateChannelSettingsDto)
  comment?: UpdateChannelSettingsDto;

  @ApiProperty({
    description: 'Mention notification settings (partial)',
    type: UpdateChannelSettingsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateChannelSettingsDto)
  mention?: UpdateChannelSettingsDto;

  @ApiProperty({
    description: 'Follow notification settings (partial)',
    type: UpdateChannelSettingsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateChannelSettingsDto)
  follow?: UpdateChannelSettingsDto;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({
    description: 'Partial update for notification preferences',
    type: UpdateNotificationTypeSettingsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationTypeSettingsDto)
  notification_preferences?: UpdateNotificationTypeSettingsDto;
}
