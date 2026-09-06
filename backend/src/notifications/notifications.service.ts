import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import type { Notification } from './notification.types.js';

@Injectable()
export class NotificationsService {
  private readonly notifications: Notification[] = [];

  create(input: CreateNotificationDto): Notification {
    const notification: Notification = {
      id: randomUUID(),
      userId: input.userId.trim(),
      message: input.message.trim(),
      type: input.type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(notification);
    return notification;
  }

  findByUser(userId: string): Notification[] {
    return this.notifications.filter((item) => item.userId === userId);
  }

  markAsRead(id: string): Notification {
    const notification = this.notifications.find((item) => item.id === id);
    if (!notification) {
      throw new NotFoundException(`notification ${id} not found`);
    }
    notification.read = true;
    return notification;
  }
}
