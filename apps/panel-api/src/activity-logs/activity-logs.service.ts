import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, action: string, details?: any) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }

  async findByUser(userId: string, options?: { skip?: number; take?: number }) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      skip: options?.skip,
      take: options?.take,
      orderBy: { timestamp: 'desc' },
    });
  }

  async list(options?: { skip?: number; take?: number }) {
    return this.prisma.activityLog.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { timestamp: 'desc' },
    });
  }

  async countByUser(userId: string) {
    return this.prisma.activityLog.count({ where: { userId } });
  }

  async findAll(options?: { skip?: number; take?: number }) {
    return this.prisma.activityLog.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { timestamp: 'desc' },
    });
  }

  async count() {
    return this.prisma.activityLog.count();
  }
}
