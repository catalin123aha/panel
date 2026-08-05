import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, botId: string | null, type: string, title: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        botId,
        type: type as any,
        title,
        message,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }
}
