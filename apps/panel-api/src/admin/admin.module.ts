import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { BotsModule } from '../bots/bots.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [UsersModule, BotsModule, ActivityLogsModule, StatisticsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
