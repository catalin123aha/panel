import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List templates' })
  async listTemplates(@Query('runtime') runtime?: string, @Query('library') library?: string) {
    return this.templatesService.findAll(runtime, library);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template details' })
  async getTemplate(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create template (admin)' })
  async createTemplate(@Request() req, @Body() data: any) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.templatesService.create(req.user.userId, data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update template (admin)' })
  async updateTemplate(@Param('id') id: string, @Request() req, @Body() data: any) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.templatesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete template (admin)' })
  async deleteTemplate(@Param('id') id: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.templatesService.remove(id);
  }
}
