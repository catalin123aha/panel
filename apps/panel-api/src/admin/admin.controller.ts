import { Controller, Get, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
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
  @ApiOperation({ summary: 'List all users (admin)' })
  async listUsers(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.listUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (admin)' })
  async getUser(@Param('id') id: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.getUser(id);
  }

  @Put('users/:id/ban')
  @ApiOperation({ summary: 'Ban user (admin)' })
  async banUser(@Param('id') id: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.banUser(id);
  }

  @Put('users/:id/unban')
  @ApiOperation({ summary: 'Unban user (admin)' })
  async unbanUser(@Param('id') id: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.unbanUser(id);
  }

  @Get('bots')
  @ApiOperation({ summary: 'List all bots (admin)' })
  async listBots(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.listBots(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Delete('bots/:id')
  @ApiOperation({ summary: 'Delete any bot (admin)' })
  async deleteBot(@Param('id') id: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.deleteBot(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics (admin)' })
  async getStats(@Request() req) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.getStats();
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get activity logs (admin)' })
  async getActivityLogs(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.adminService.getActivityLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}
