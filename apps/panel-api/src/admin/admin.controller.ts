import { Controller, Get, Put, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listUsers({
      skip: page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 10) : 0,
      take: limit ? parseInt(limit) : 10,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Put('users/:id/ban')
  @ApiOperation({ summary: 'Ban user' })
  async banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Put('users/:id/unban')
  @ApiOperation({ summary: 'Unban user' })
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('bots')
  @ApiOperation({ summary: 'List all bots' })
  async listBots() {
    return this.adminService.listBots();
  }

  @Delete('bots/:id')
  @ApiOperation({ summary: 'Delete bot' })
  async deleteBot(@Param('id') id: string) {
    return this.adminService.deleteBot(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  async getStats() {
    return this.adminService.getSystemStats();
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get system activity logs' })
  async getActivityLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getActivityLogs({
      skip: page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 10) : 0,
      take: limit ? parseInt(limit) : 10,
    });
  }
}
