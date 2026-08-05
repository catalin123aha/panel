import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { generateToken } from '@bot-hosting/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getDiscordAuthUrl(): Promise<string> {
    const clientId = this.configService.get('DISCORD_CLIENT_ID') || 'mock_client_id';
    const redirectUri = this.configService.get('DISCORD_CALLBACK_URL') || 'http://localhost:3002/login';
    const scopes = this.configService.get('DISCORD_SCOPES', 'identify,guilds').split(',');

    const state = generateToken(32);
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes.join('%20')}&state=${state}`;

    return url;
  }

  async exchangeCodeForTokens(code: string, state: string) {
    // Mock implementation for development without database
    const mockUser = {
      id: 'mock_user_id',
      discordId: 'mock_discord_id',
      username: 'TestUser',
      discriminator: '1234',
      avatar: null,
      email: 'test@example.com',
      isAdmin: false,
      maxBots: 5,
    };

    const accessToken = this.jwtService.sign({
      sub: mockUser.id,
      discordId: mockUser.discordId,
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: mockUser.id,
        type: 'refresh',
      },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
      user: mockUser,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const mockUser = {
        id: payload.sub,
        discordId: 'mock_discord_id',
        username: 'TestUser',
        discriminator: '1234',
        avatar: null,
        email: 'test@example.com',
        isAdmin: false,
        maxBots: 5,
      };

      const accessToken = this.jwtService.sign({
        sub: mockUser.id,
        discordId: mockUser.discordId,
      });

      const newRefreshToken = this.jwtService.sign(
        {
          sub: mockUser.id,
          type: 'refresh',
        },
        { expiresIn: '7d' },
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    return { success: true };
  }

  async validateUser(userId: string) {
    // Mock implementation
    return {
      id: userId,
      discordId: 'mock_discord_id',
      username: 'TestUser',
      discriminator: '1234',
      avatar: null,
      email: 'test@example.com',
      isAdmin: false,
      maxBots: 5,
    };
  }
}
