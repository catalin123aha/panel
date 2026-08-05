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
      },
    });
  }

  async getUserRepos(userId: string) {
    return this.prisma.gitHubRepo.findMany({
      where: { userId },
    });
  }

  async list(userId: string) {
    return this.getUserRepos(userId);
  }

  async disconnect(userId: string, repoId: string) {
    const repo = await this.prisma.gitHubRepo.findFirst({
      where: { id: repoId, userId },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    await this.prisma.gitHubRepo.delete({
      where: { id: repoId },
    });
  }

  async pull(userId: string, repoId: string) {
    const repo = await this.prisma.gitHubRepo.findFirst({
      where: { id: repoId, userId },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    // In a real implementation, this would trigger a pull from GitHub
    return { success: true };
  }

  async handleWebhook(repoId: string, payload?: any) {
    const repo = await this.prisma.gitHubRepo.findFirst({
      where: { id: repoId },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    // In a real implementation, this would trigger a deployment
    return { success: true };
  }
}
