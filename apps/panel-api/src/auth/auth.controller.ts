import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('discord/login')
  @ApiOperation({ summary: 'Get Discord OAuth2 login URL' })
  async getDiscordLoginUrl() {
    const url = await this.authService.getDiscordAuthUrl();
    return { url };
  }

  @Post('discord/callback')
  @ApiOperation({ summary: 'Handle Discord OAuth2 callback' })
  async discordCallback(@Body() body: { code: string; state: string }) {
    return this.authService.exchangeCodeForTokens(body.code, body.state);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@Request() req) {
    return this.authService.validateUser(req.user.userId);
  }
}
