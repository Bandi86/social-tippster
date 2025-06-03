import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChannelSettingsDto,
  NotificationPreferencesDto,
  NotificationTypeSettingsDto,
  UpdateChannelSettingsDto,
  UpdateNotificationPreferencesDto,
} from './dto/notification-preferences.dto';
import { UserSettings } from './entities/user-settings.entity';

// Default preferences using the DTO structure
export const DEFAULT_PREFERENCES: NotificationTypeSettingsDto = {
  comment: { in_app: true, email: false, push: false },
  mention: { in_app: true, email: true, push: false },
  follow: { in_app: true, email: false, push: false },
};

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
  ) {}

  async getPreferences(userId: string): Promise<NotificationPreferencesDto> {
    let settings: UserSettings | null = await this.userSettingsRepository.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      settings = await this.createDefault(userId);
    }

    // Ensure we return properly typed preferences
    const preferences =
      (settings.notification_preferences as NotificationTypeSettingsDto) || DEFAULT_PREFERENCES;
    return { notification_preferences: preferences };
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    let settings: UserSettings | null = await this.userSettingsRepository.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      settings = await this.createDefault(userId);
    }

    // Get current preferences or use defaults
    const current: NotificationTypeSettingsDto =
      (settings.notification_preferences as NotificationTypeSettingsDto) || DEFAULT_PREFERENCES;

    // Apply updates if provided
    const updates = dto.notification_preferences;
    if (updates) {
      const merged: NotificationTypeSettingsDto = {
        comment: this.mergeChannelSettings(current.comment, updates.comment),
        mention: this.mergeChannelSettings(current.mention, updates.mention),
        follow: this.mergeChannelSettings(current.follow, updates.follow),
      };

      settings.notification_preferences = merged;
      await this.userSettingsRepository.save(settings);
      return { notification_preferences: merged };
    }

    return { notification_preferences: current };
  }

  async createDefault(userId: string): Promise<UserSettings> {
    const settings = this.userSettingsRepository.create({
      user_id: userId,
      notification_preferences: { ...DEFAULT_PREFERENCES },
    });
    return this.userSettingsRepository.save(settings);
  }

  async resetPreferences(userId: string): Promise<NotificationPreferencesDto> {
    let settings: UserSettings | null = await this.userSettingsRepository.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      settings = await this.createDefault(userId);
    } else {
      settings.notification_preferences = { ...DEFAULT_PREFERENCES };
      await this.userSettingsRepository.save(settings);
    }

    return { notification_preferences: { ...DEFAULT_PREFERENCES } };
  }

  /**
   * Helper method to merge channel settings with partial updates
   */
  private mergeChannelSettings(
    current: ChannelSettingsDto,
    updates?: UpdateChannelSettingsDto,
  ): ChannelSettingsDto {
    if (!updates) {
      return current;
    }

    return {
      in_app: updates.in_app !== undefined ? updates.in_app : current.in_app,
      email: updates.email !== undefined ? updates.email : current.email,
      push: updates.push !== undefined ? updates.push : current.push,
    };
  }
}
