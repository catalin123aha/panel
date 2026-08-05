import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BotsModule } from './bots/bots.module';
import { TemplatesModule } from './templates/templates.module';
import { GitHubModule } from './github/github.module';
import { BackupsModule } from './backups/backups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { AdminModule } from './admin/admin.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    BotsModule,
    TemplatesModule,
    GitHubModule,
    BackupsModule,
    NotificationsModule,
    StatisticsModule,
    ActivityLogsModule,
    AdminModule,
    WebsocketModule,
  ],
})
export class AppModule {}
