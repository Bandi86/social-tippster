import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../admin/analytics-dashboard/analytics.module';
import { UserSettings } from './entities/user-settings.entity';
import { User } from './entities/user.entity';
import { UserSettingsService } from './users-settings.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSettings]), AnalyticsModule],
  controllers: [UsersController],
  providers: [UsersService, UserSettingsService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
