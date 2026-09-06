import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(
    @Body()
    body: {
      userId: string;
      message: string;
      type: string;
    },
  ) {
    return this.notificationsService.create(body);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(userId);
  }
}
