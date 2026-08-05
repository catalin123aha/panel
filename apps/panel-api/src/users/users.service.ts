import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findById(id: string) {
    return this.findOne(id);
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

  async getBots(userId: string) {
    return this.prisma.bot.findMany({
      where: { userId },
    });
  }

  async getUserBots(userId: string) {
    return this.getBots(userId);
  }

  async incrementBotCount(userId: string) {
    const botCount = await this.prisma.bot.count({
      where: { userId },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { botCount },
    });
  }

  async decrementBotCount(userId: string) {
    const botCount = await this.prisma.bot.count({
      where: { userId },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { botCount },
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

  async findAll(options?: { skip?: number; take?: number }) {
    return this.prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
    });
  }

  async count() {
    return this.prisma.user.count();
  }

  sanitizeUser(user: any) {
    const { accessToken, refreshToken, tokenExpiresAt, ...sanitized } = user;
    return sanitized;
  }
}
