import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    discordId: string;
    username: string;
    discriminator: string;
    avatar?: string;
    email?: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: Date;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByDiscordId(discordId: string) {
    return this.prisma.user.findUnique({
      where: { discordId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async sanitizeUser(user: any) {
    const { accessToken, refreshToken, ...sanitized } = user;
    return sanitized;
  }

  async getUserBots(userId: string) {
    return this.prisma.bot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async banUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBanned: true },
    });
  }

  async unbanUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBanned: false },
    });
  }

  async listUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((user) => this.sanitizeUser(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
