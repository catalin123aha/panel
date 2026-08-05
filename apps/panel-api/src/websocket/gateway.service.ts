import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GatewayService {
  constructor(private prisma: PrismaService) {}

  async getAllBots() {
    return this.prisma.bot.findMany();
  }

  async getBotById(id: string) {
    return this.prisma.bot.findFirst({
      where: { id },
    });
  }

  async getUserBots(userId: string) {
    return this.prisma.bot.findMany({
      where: { userId },
    });
  }

  async validateBotAccess(botId: string, userId: string) {
    const bot = await this.prisma.bot.findFirst({
      where: { id: botId, userId },
    });

    return !!bot;
  }
}
