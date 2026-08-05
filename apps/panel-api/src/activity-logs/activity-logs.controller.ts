import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activity Logs')
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user activity logs' })
  async listLogs(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.activityLogsService.list(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}
