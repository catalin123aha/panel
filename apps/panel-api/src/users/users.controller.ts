import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return null;
    }
    return this.usersService.sanitizeUser(user);
  }

  @Get(':id/bots')
  @ApiOperation({ summary: 'Get user bots' })
  async getUserBots(@Param('id') id: string) {
    return this.usersService.getUserBots(id);
  }
}
