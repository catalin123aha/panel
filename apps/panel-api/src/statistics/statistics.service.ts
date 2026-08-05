import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const [totalBots, runningBots, stoppedBots, bots] = await Promise.all([
      this.prisma.bot.count({ where: { userId } }),
      this.prisma.bot.count({ where: { userId, status: 'RUNNING' } }),
      this.prisma.bot.count({ where: { userId, status: 'STOPPED' } }),
      this.prisma.bot.findMany({
        where: { userId },
        select: { status: true, createdAt: true },
      }),
    ]);

    const recentActivity = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return {
      totalBots,
      runningBots,
      stoppedBots,
      bots,
      recentActivity,
    };
  }

  async getBotStats(botId: string, userId: string) {
    const bot = await this.prisma.bot.findFirst({
      where: { id: botId, userId },
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    return this.prisma.statistics.findMany({
      where: { botId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async recordBotStats(botId: string, data: any) {
    return this.prisma.statistics.create({
      data: {
        botId,
        ...data,
      },
    });
  }

  async getSystemStats() {
    const [totalUsers, totalBots, runningBots] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.bot.count(),
      this.prisma.bot.count({ where: { status: 'RUNNING' } }),
    ]);

    const bots = await this.prisma.bot.findMany({
      select: { status: true, runtime: true, library: true },
    });

    return {
      totalUsers,
      totalBots,
      runningBots,
      bots,
    };
  }
}
