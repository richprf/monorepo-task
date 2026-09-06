import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from '../notification.types.js';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsIn(NOTIFICATION_TYPES)
  type: NotificationType;
}

export class NotificationIdParamDto {
  @IsUUID('4')
  id: string;
}
