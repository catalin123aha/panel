import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// Mock PrismaService for development without database
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('Using mock PrismaService for development (no database)');
  }

  async onModuleDestroy() {
    console.log('Mock PrismaService destroyed');
  }

  // Helper method to handle any Prisma query
  private async handleQuery(method: string, model: string, data?: any) {
    console.log(`Mock PrismaService: ${model}.${method}`, data);
    return [];
  }

  // Mock properties for Prisma models with parameter support
  user = {
    create: async (data: any) => ({ id: 'mock_id', ...data.data }),
    findUnique: async (data: any) => ({ id: 'mock_id', discordId: 'mock_discord_id', username: 'TestUser', discriminator: '1234', avatar: null, email: 'test@example.com', isAdmin: false, maxBots: 5, isBanned: false }),
    findMany: async (data?: any) => [],
    update: async (data: any) => ({ id: 'mock_id', ...data.data }),
    delete: async (data?: any) => ({ id: 'mock_id' }),
    count: async (data?: any) => 0,
  };

  bot = {
    create: async (data: any) => ({ id: 'mock_bot_id', ...data.data }),
    findUnique: async (data: any) => ({ id: 'mock_bot_id', name: 'Mock Bot', status: 'STOPPED', runtime: 'nodejs', library: 'discordjs' }),
    findMany: async (data?: any) => [],
    findFirst: async (data?: any) => null,
    update: async (data: any) => ({ id: 'mock_bot_id', ...data.data }),
    delete: async (data?: any) => ({ id: 'mock_bot_id' }),
    count: async (data?: any) => 0,
  };

  session = {
    create: async (data: any) => ({ id: 'mock_session_id', ...data.data }),
    findUnique: async (data: any) => ({ id: 'mock_session_id', ...data }),
    update: async (data: any) => ({ id: 'mock_session_id', ...data.data }),
    deleteMany: async (data?: any) => ({ count: 0 }),
  };

  template = {
    create: async (data: any) => ({ id: 'mock_template_id', ...data.data }),
    findUnique: async (data: any) => ({ id: 'mock_template_id', ...data }),
    findMany: async (data?: any) => [],
    update: async (data: any) => ({ id: 'mock_template_id', ...data.data }),
    delete: async (data?: any) => ({ id: 'mock_template_id' }),
  };

  statistics = {
    create: async (data: any) => ({ id: 'mock_stats_id', ...data.data }),
    findMany: async (data?: any) => [],
  };

  notification = {
    create: async (data: any) => ({ id: 'mock_notification_id', ...data.data }),
    findMany: async (data?: any) => [],
    findFirst: async (data?: any) => ({ id: 'mock_notification_id', ...data }),
    update: async (data: any) => ({ id: 'mock_notification_id', ...data.data }),
    updateMany: async (data?: any) => ({ count: 0 }),
    delete: async (data?: any) => ({ id: 'mock_notification_id' }),
    count: async (data?: any) => 0,
  };

  activityLog = {
    create: async (data: any) => ({ id: 'mock_log_id', ...data.data }),
    findMany: async (data?: any) => [],
    count: async (data?: any) => 0,
  };

  gitHubRepo = {
    create: async (data: any) => ({ id: 'mock_repo_id', ...data.data }),
    findMany: async (data?: any) => [],
    findFirst: async (data?: any) => ({ id: 'mock_repo_id', ...data }),
    delete: async (data?: any) => ({ id: 'mock_repo_id' }),
  };

  async cleanDatabase() {
    console.log('Clean database - mock implementation');
  }
}
