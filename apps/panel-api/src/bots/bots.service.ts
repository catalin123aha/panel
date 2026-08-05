import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BotStatus, BotRuntime, BotLibrary } from '@bot-hosting/types';

@Injectable()
export class BotsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.bot.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.bot.findUnique({
      where: { id },
    });
  }

  async create(userId: string, data: any) {
    // Check user exists and has quota
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check bot count
    const botCount = await this.prisma.bot.count({
      where: { userId },
    });

    if (botCount >= user.maxBots) {
      throw new Error('Bot limit reached');
    }

    // Get template if specified
    if (data.templateId) {
      const template = await this.prisma.template.findUnique({
        where: { id: data.templateId },
      });

      if (!template) {
        throw new Error('Template not found');
      }
    }

    // Create bot
    const bot = await this.prisma.bot.create({
      data: {
        ...data,
        userId,
        status: BotStatus.CREATING,
      },
    });

    return bot;
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.bot.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    await this.prisma.bot.delete({
      where: { id },
    });
  }

  async start(id: string, userId: string) {
    return this.prisma.bot.update({
      where: { id },
      data: { status: BotStatus.RESTARTING },
    });
  }

  async stop(id: string, userId: string) {
    return this.prisma.bot.update({
      where: { id },
      data: { status: BotStatus.STOPPED },
    });
  }

  async restart(id: string, userId: string) {
    return this.prisma.bot.update({
      where: { id },
      data: { status: BotStatus.RESTARTING },
    });
  }

  async kill(id: string, userId: string) {
    return this.prisma.bot.update({
      where: { id },
      data: { status: BotStatus.STOPPED },
    });
  }

  async reinstall(id: string, userId: string) {
    return this.prisma.bot.update({
      where: { id },
      data: { status: BotStatus.CREATING },
    });
  }

  async rebuild(id: string, userId: string) {
    return this.prisma.bot.update({
      where: { id },
      data: { status: BotStatus.CREATING },
    });
  }

  async clone(id: string, userId: string, name: string) {
    const originalBot = await this.prisma.bot.findUnique({
      where: { id },
    });

    if (!originalBot) {
      throw new Error('Bot not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const botCount = await this.prisma.bot.count({
      where: { userId },
    });

    if (botCount >= user.maxBots) {
      throw new Error('Bot limit reached');
    }

    const clonedBot = await this.prisma.bot.create({
      data: {
        name,
        userId,
        runtime: originalBot.runtime,
        library: originalBot.library,
        status: BotStatus.CREATING,
      },
    });

    return clonedBot;
  }

  async getStats(id: string, userId: string) {
    return this.prisma.statistics.findMany({
      where: { botId: id },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async getLogs(id: string, userId: string, limit: number = 100) {
    const bot = await this.prisma.bot.findFirst({
      where: { id, userId },
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    // In a real implementation, this would fetch logs from the daemon
    return [];
  }
}
