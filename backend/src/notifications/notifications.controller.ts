import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateNotificationDto,
  NotificationIdParamDto,
} from './dto/create-notification.dto.js';
import { NotificationsGateway } from './notifications.gateway.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Post()
  create(@Body() body: CreateNotificationDto) {
    const notification = this.notificationsService.create(body);
    this.notificationsGateway.pushToUser(notification.userId, notification);
    return notification;
  }

  @Patch(':id/read')
  markAsRead(@Param() params: NotificationIdParamDto) {
    return this.notificationsService.markAsRead(params.id);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(userId);
  }
}
