import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activity Logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List activity logs' })
  async listLogs(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.activityLogsService.list({
      skip: page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 10) : 0,
      take: limit ? parseInt(limit) : 10,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create activity log' })
  async createLog(@Request() req, @Body() data: { action: string; details?: any }) {
    return this.activityLogsService.create(req.user.userId, data.action, data.details);
  }
}
