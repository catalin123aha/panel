import { Controller, Get, Put, Delete, Param, UseGuards, Request } from '@nestjs/common';
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
  @ApiOperation({ summary: 'List notifications' })
  async listNotifications(@Request() req) {
    return this.notificationsService.list(req.user.userId);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param('id') id: string, @Request() req) {
    return this.notificationsService.delete(id, req.user.userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread count' })
  async getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }
}
