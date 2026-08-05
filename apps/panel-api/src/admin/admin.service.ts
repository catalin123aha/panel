import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async listUsers(options?: { skip?: number; take?: number }) {
    return this.usersService.findAll(options);
  }

  async getUser(id: string) {
    return this.usersService.findById(id);
  }

  async banUser(id: string) {
    return this.usersService.banUser(id);
  }

  async unbanUser(id: string) {
    return this.usersService.unbanUser(id);
  }

  async listBots() {
    return this.prisma.bot.findMany();
  }

  async deleteBot(id: string) {
    await this.prisma.bot.delete({
      where: { id },
    });
  }

  async getSystemStats() {
    const [totalUsers, totalBots, runningBots] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.bot.count(),
      this.prisma.bot.count({ where: { status: 'RUNNING' } }),
    ]);

    return {
      totalUsers,
      totalBots,
      runningBots,
    };
  }

  async getActivityLogs(options?: { skip?: number; take?: number }) {
    return this.prisma.activityLog.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { timestamp: 'desc' },
    });
  }
}
