import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Create template' })
  async createTemplate(@Request() req, @Body() data: any) {
    return this.templatesService.create(req.user.userId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.templatesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
