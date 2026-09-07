import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { NotificationsGateway } from './notifications.gateway.js';
import type { Notification } from './notification.types.js';

@Injectable()
export class NotificationsService {
  private readonly notifications: Notification[] = [];

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  create(input: CreateNotificationDto): Notification {
    const userId = input.userId.trim();
    const notification: Notification = {
      id: randomUUID(),
      userId,
      message: input.message.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(notification);

    if (this.notificationsGateway.isUserOnline(userId)) {
      this.notificationsGateway.sendToUser(userId, notification);
      console.log(`کاربر آنلاین است: ${userId} — اعلان با WebSocket ارسال شد`);
    } else {
      console.log(`کاربر آفلاین است: ${userId} — اعلان فقط ذخیره شد`);
    }

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
