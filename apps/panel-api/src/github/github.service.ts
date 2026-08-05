import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GitHubService {
  constructor(private prisma: PrismaService) {}

  async connect(userId: string, data: any) {
    return this.prisma.gitHubRepo.create({
      data: {
        userId,
        ...data,
        webhookSecret: this.generateWebhookSecret(),
      },
    });
  }

  async list(userId: string) {
    return this.prisma.gitHubRepo.findMany({
      where: { userId },
    });
  }

  async disconnect(id: string, userId: string) {
    const repo = await this.prisma.gitHubRepo.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    await this.prisma.gitHubRepo.delete({
      where: { id },
    });

    return { message: 'Repository disconnected' };
  }

  async pull(id: string, userId: string) {
    const repo = await this.prisma.gitHubRepo.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    // TODO: Queue pull job

    return { message: 'Pull initiated' };
  }

  async handleWebhook(payload: any) {
    // TODO: Validate webhook signature
    // TODO: Queue deployment job

    return { message: 'Webhook received' };
  }

  private generateWebhookSecret(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
