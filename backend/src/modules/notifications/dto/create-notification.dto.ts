import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationPriority, NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: 'string', format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  related_post_id?: string;

  @ApiProperty({ type: 'string', format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  related_comment_id?: string;

  @ApiProperty({ type: 'string', format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  related_user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action_url?: string;

  @ApiProperty({ enum: NotificationPriority, required: false, default: NotificationPriority.LOW })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.LOW;
}
