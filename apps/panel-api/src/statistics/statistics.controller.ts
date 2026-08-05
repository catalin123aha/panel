import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Statistics')
@Controller('stats')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Request() req) {
    return this.statisticsService.getDashboardStats(req.user.userId);
  }

  @Get('bots/:botId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bot historical statistics' })
  async getBotStats(
    @Request() req,
    @Param('botId') botId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.statisticsService.getBotHistoricalStats(
      botId,
      req.user.userId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform usage statistics' })
  async getPlatformStats(@Request() req) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.statisticsService.getPlatformStats();
  }
}
