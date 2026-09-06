import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  isNotificationType,
  type Notification,
  type NotificationType,
} from './notification.types.js';

@Injectable()
export class NotificationsService {
  private readonly notifications: Notification[] = [];

  create(input: {
    userId: string;
    message: string;
    type: string;
  }): Notification {
    const userId = input.userId?.trim();
    const message = input.message?.trim();
    const type = input.type?.trim();

    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    if (!message) {
      throw new BadRequestException('message is required');
    }
    if (!type || !isNotificationType(type)) {
      throw new BadRequestException(
        'type must be one of: info, success, warning, error',
      );
    }

    const notification: Notification = {
      id: randomUUID(),
      userId,
      message,
      type: type as NotificationType,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(notification);
    return notification;
  }

  findByUser(userId: string): Notification[] {
    return this.notifications.filter((item) => item.userId === userId);
  }
}
