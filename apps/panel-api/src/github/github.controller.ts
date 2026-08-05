import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GitHubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('GitHub')
@Controller('github')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GitHubController {
  constructor(private gitHubService: GitHubService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect GitHub repository' })
  async connectRepo(@Request() req, @Body() data: any) {
    return this.gitHubService.connect(req.user.userId, data);
  }

  @Get('repos')
  @ApiOperation({ summary: 'List user repositories' })
  async listRepos(@Request() req) {
    return this.gitHubService.getUserRepos(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect repository' })
  async disconnectRepo(@Request() req, @Param('id') id: string) {
    return this.gitHubService.disconnect(req.user.userId, id);
  }

  @Post(':id/pull')
  @ApiOperation({ summary: 'Pull from repository' })
  async pullRepo(@Request() req, @Param('id') id: string) {
    return this.gitHubService.pull(req.user.userId, id);
  }

  @Post(':id/webhook')
  @ApiOperation({ summary: 'Handle GitHub webhook' })
  async handleWebhook(@Param('id') id: string, @Body() payload: any) {
    return this.gitHubService.handleWebhook(id, payload);
  }
}
