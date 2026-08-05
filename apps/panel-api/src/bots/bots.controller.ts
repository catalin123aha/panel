import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BotsService } from './bots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBotDto, UpdateBotDto } from '@bot-hosting/types';

@ApiTags('Bots')
@Controller('bots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BotsController {
  constructor(private botsService: BotsService) {}

  @Get()
  @ApiOperation({ summary: 'List user bots' })
  async listBots(@Request() req) {
    return this.botsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new bot' })
  async createBot(@Request() req, @Body() data: CreateBotDto) {
    return this.botsService.create(req.user.userId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bot details' })
  async getBot(@Param('id') id: string, @Request() req) {
    return this.botsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bot' })
  async updateBot(@Param('id') id: string, @Request() req, @Body() data: UpdateBotDto) {
    return this.botsService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bot' })
  async deleteBot(@Param('id') id: string, @Request() req) {
    return this.botsService.remove(id, req.user.userId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start bot' })
  async startBot(@Param('id') id: string, @Request() req) {
    return this.botsService.start(id, req.user.userId);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop bot' })
  async stopBot(@Param('id') id: string, @Request() req) {
    return this.botsService.stop(id, req.user.userId);
  }

  @Post(':id/restart')
  @ApiOperation({ summary: 'Restart bot' })
  async restartBot(@Param('id') id: string, @Request() req) {
    return this.botsService.restart(id, req.user.userId);
  }

  @Post(':id/kill')
  @ApiOperation({ summary: 'Kill bot' })
  async killBot(@Param('id') id: string, @Request() req) {
    return this.botsService.kill(id, req.user.userId);
  }

  @Post(':id/reinstall')
  @ApiOperation({ summary: 'Reinstall bot' })
  async reinstallBot(@Param('id') id: string, @Request() req) {
    return this.botsService.reinstall(id, req.user.userId);
  }

  @Post(':id/rebuild')
  @ApiOperation({ summary: 'Rebuild bot' })
  async rebuildBot(@Param('id') id: string, @Request() req) {
    return this.botsService.rebuild(id, req.user.userId);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone bot' })
  async cloneBot(@Param('id') id: string, @Request() req, @Body() body: { name: string }) {
    return this.botsService.clone(id, req.user.userId, body.name);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get bot statistics' })
  async getBotStats(@Param('id') id: string, @Request() req) {
    return this.botsService.getStats(id, req.user.userId);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get bot logs' })
  async getBotLogs(@Param('id') id: string, @Request() req, @Query('limit') limit?: string) {
    return this.botsService.getLogs(id, req.user.userId, limit ? parseInt(limit) : 100);
  }
}
