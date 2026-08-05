import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BotsService } from '../bots/bots.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { StatisticsService } from '../statistics/statistics.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private botsService: BotsService,
    private activityLogsService: ActivityLogsService,
    private statisticsService: StatisticsService,
  ) {}

  async listUsers(page: number = 1, limit: number = 10) {
    return this.usersService.listUsers(page, limit);
  }

  async getUser(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.sanitizeUser(user);
  }

  async banUser(id: string) {
    return this.usersService.banUser(id);
  }

  async unbanUser(id: string) {
    return this.usersService.unbanUser(id);
  }

  async listBots(page: number = 1, limit: number = 10) {
    // TODO: Implement pagination
    return [];
  }

  async deleteBot(id: string) {
    // TODO: Implement bot deletion
    return { message: 'Bot deleted' };
  }

  async getStats() {
    return this.statisticsService.getPlatformStats();
  }

  async getActivityLogs(page: number = 1, limit: number = 10) {
    return this.activityLogsService.listAll(page, limit);
  }
}
