import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, botId: string | null, action: string, details: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        botId,
        action,
        details: details as any,
        ipAddress,
        userAgent,
      },
    });
  }

  async list(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where: { userId } }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              discriminator: true,
            },
          },
          bot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count(),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
