import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Statistics')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Request() req) {
    return this.statisticsService.getDashboardStats(req.user.userId);
  }

  @Get('bots/:botId')
  @ApiOperation({ summary: 'Get bot statistics' })
  async getBotStats(@Param('botId') botId: string, @Request() req) {
    return this.statisticsService.getBotStats(botId, req.user.userId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get platform usage statistics' })
  async getPlatformStats() {
    return this.statisticsService.getSystemStats();
  }
}
