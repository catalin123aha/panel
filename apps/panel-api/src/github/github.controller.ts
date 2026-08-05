import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GitHubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('GitHub')
@Controller('github')
export class GitHubController {
  constructor(private gitHubService: GitHubService) {}

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect GitHub repository' })
  async connectRepo(@Request() req, @Body() data: any) {
    return this.gitHubService.connect(req.user.userId, data);
  }

  @Get('repos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List GitHub repositories' })
  async listRepos(@Request() req) {
    return this.gitHubService.list(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect GitHub repository' })
  async disconnectRepo(@Param('id') id: string, @Request() req) {
    return this.gitHubService.disconnect(id, req.user.userId);
  }

  @Post(':id/pull')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pull latest changes' })
  async pullRepo(@Param('id') id: string, @Request() req) {
    return this.gitHubService.pull(id, req.user.userId);
  }

  @Post(':id/webhook')
  @ApiOperation({ summary: 'Handle GitHub webhook' })
  async handleWebhook(@Param('id') id: string, @Body() payload: any) {
    return this.gitHubService.handleWebhook(payload);
  }
}
