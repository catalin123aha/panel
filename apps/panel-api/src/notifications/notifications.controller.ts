import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  async listNotifications(@Request() req) {
    return this.notificationsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create notification' })
  async createNotification(@Request() req, @Body() data: any) {
    return this.notificationsService.create(req.user.userId, data);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Request() req, @Param('id') id: string) {
    return this.notificationsService.delete(req.user.userId, id);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  async getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }
}
