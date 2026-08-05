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
        select: {
          cpuLimit: true,
          memoryLimit: true,
          diskLimit: true,
        },
      }),
    ]);

    const totalCpuUsage = bots.reduce((sum, bot) => sum + bot.cpuLimit, 0);
    const totalMemoryUsage = bots.reduce((sum, bot) => sum + bot.memoryLimit, 0);
    const totalStorageUsage = bots.reduce((sum, bot) => sum + bot.diskLimit, 0);

    const recentActivity = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // TODO: Get latest logs from daemon

    return {
      totalBots,
      runningBots,
      stoppedBots,
      totalCpuUsage,
      totalMemoryUsage,
      totalStorageUsage,
      recentActivity,
      latestLogs: [],
    };
  }

  async getBotHistoricalStats(botId: string, userId: string, from?: Date, to?: Date) {
    // Verify bot ownership
    const bot = await this.prisma.bot.findFirst({
      where: { id: botId, userId },
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    const where: any = { botId };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    return this.prisma.statistics.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });
  }

  async getPlatformStats() {
    const [totalUsers, totalBots, activeBots] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.bot.count(),
      this.prisma.bot.count({ where: { status: 'RUNNING' } }),
    ]);

    const bots = await this.prisma.bot.findMany({
      select: {
        cpuLimit: true,
        memoryLimit: true,
        diskLimit: true,
      },
    });

    const totalCpuUsage = bots.reduce((sum, bot) => sum + bot.cpuLimit, 0);
    const totalMemoryUsage = bots.reduce((sum, bot) => sum + bot.memoryLimit, 0);
    const totalStorageUsage = bots.reduce((sum, bot) => sum + bot.diskLimit, 0);

    return {
      totalUsers,
      totalBots,
      activeBots,
      totalCpuUsage,
      totalMemoryUsage,
      totalStorageUsage,
      uptime: process.uptime(),
    };
  }

  async saveStats(botId: string, stats: {
    cpuPercent: number;
    memoryMb: number;
    diskMb: number;
    networkRxMb: number;
    networkTxMb: number;
  }) {
    return this.prisma.statistics.create({
      data: {
        botId,
        ...stats,
      },
    });
  }
}
