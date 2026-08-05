import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BotStatus, BotRuntime, BotLibrary } from '@prisma/client';

@Injectable()
export class BotsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    name: string;
    description?: string;
    runtime: string;
    runtimeVersion: string;
    library: string;
    templateId?: string;
  }) {
    // Check user's bot limit
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { bots: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user._count.bots >= user.maxBots) {
      throw new ForbiddenException('Bot limit reached');
    }

    // Validate template if provided
    if (data.templateId) {
      const template = await this.prisma.template.findUnique({
        where: { id: data.templateId },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      if (template.runtime !== data.runtime || template.library !== data.library) {
        throw new ForbiddenException('Template does not match runtime/library');
      }
    }

    const bot = await this.prisma.bot.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        runtime: data.runtime as any,
        runtimeVersion: data.runtimeVersion,
        library: data.library as any,
        templateId: data.templateId,
        status: 'CREATING' as any,
        containerName: `bot-${Date.now()}`,
      },
    });

    // TODO: Queue container creation job

    return bot;
  }

  async findAll(userId: string) {
    return this.prisma.bot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const bot = await this.prisma.bot.findUnique({
      where: { id },
    });

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    if (bot.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return bot;
  }

  async update(id: string, userId: string, data: {
    name?: string;
    description?: string;
    envData?: Record<string, string>;
    autoDeploy?: boolean;
  }) {
    const bot = await this.findOne(id, userId);

    return this.prisma.bot.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Stop and remove container

    await this.prisma.bot.delete({
      where: { id },
    });

    return { message: 'Bot deleted successfully' };
  }

  async start(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Start container

    return this.prisma.bot.update({
      where: { id },
      data: {
        status: 'RUNNING' as any,
        lastStartedAt: new Date(),
      },
    });
  }

  async stop(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Stop container

    return this.prisma.bot.update({
      where: { id },
      data: {
        status: 'STOPPED' as any,
        lastStoppedAt: new Date(),
      },
    });
  }

  async restart(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Restart container

    return this.prisma.bot.update({
      where: { id },
      data: {
        status: 'RESTARTING' as any,
        restartCount: { increment: 1 },
      },
    });
  }

  async kill(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Kill container

    return this.prisma.bot.update({
      where: { id },
      data: {
        status: 'STOPPED' as any,
        lastStoppedAt: new Date(),
      },
    });
  }

  async reinstall(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Reinstall container

    return { message: 'Bot reinstalled successfully' };
  }

  async rebuild(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Rebuild container

    return { message: 'Bot rebuilt successfully' };
  }

  async clone(id: string, userId: string, name: string) {
    const bot = await this.findOne(id, userId);

    // Check user's bot limit
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { bots: true } } },
    });

    if (user._count.bots >= user.maxBots) {
      throw new ForbiddenException('Bot limit reached');
    }

    const clonedBot = await this.prisma.bot.create({
      data: {
        userId,
        name,
        description: bot.description,
        runtime: bot.runtime,
        runtimeVersion: bot.runtimeVersion,
        library: bot.library,
        templateId: bot.templateId,
        status: 'CREATING' as any,
        containerName: `bot-${Date.now()}`,
        envData: bot.envData as any,
        cpuLimit: bot.cpuLimit,
        memoryLimit: bot.memoryLimit,
        diskLimit: bot.diskLimit,
      },
    });

    // TODO: Clone container files

    return clonedBot;
  }

  async getStats(id: string, userId: string) {
    const bot = await this.findOne(id, userId);

    // TODO: Get container stats from daemon

    return this.prisma.statistics.findMany({
      where: { botId: id },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async getLogs(id: string, userId: string, limit: number = 100) {
    const bot = await this.findOne(id, userId);

    // TODO: Get logs from daemon

    return [];
  }
}
