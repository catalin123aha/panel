import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { encrypt, decrypt, generateToken, hashString, compareHash } from '@bot-hosting/shared';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getDiscordAuthUrl(): Promise<string> {
    const clientId = this.configService.get('DISCORD_CLIENT_ID');
    const redirectUri = this.configService.get('DISCORD_CALLBACK_URL');
    const scopes = this.configService.get('DISCORD_SCOPES', 'identify,guilds').split(',');

    const state = generateToken(32);
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes.join('%20')}&state=${state}`;

    return url;
  }

  async exchangeCodeForTokens(code: string, state: string) {
    try {
      const clientId = this.configService.get('DISCORD_CLIENT_ID');
      const clientSecret = this.configService.get('DISCORD_CLIENT_SECRET');
      const redirectUri = this.configService.get('DISCORD_CALLBACK_URL');

      const response = await axios.post('https://discord.com/api/oauth2/token', {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      });

      const { access_token, refresh_token, expires_in } = response.data;

      // Get user info
      const userResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const discordUser = userResponse.data;

      // Find or create user
      let user = await this.prisma.user.findUnique({
        where: { discordId: discordUser.id },
      });

      if (!user) {
        user = await this.usersService.create({
          discordId: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
          accessToken: encrypt(access_token, this.configService.get('JWT_SECRET')),
          refreshToken: encrypt(refresh_token, this.configService.get('JWT_SECRET')),
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            email: discordUser.email,
            accessToken: encrypt(access_token, this.configService.get('JWT_SECRET')),
            refreshToken: encrypt(refresh_token, this.configService.get('JWT_SECRET')),
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            lastLoginAt: new Date(),
          },
        });
      }

      if (user.isBanned) {
        throw new UnauthorizedException('Account is banned');
      }

      // Generate JWT tokens
      const tokens = await this.generateTokens(user.id);

      // Create session
      await this.prisma.session.create({
        data: {
          userId: user.id,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return {
        user: this.usersService.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to exchange code for tokens');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const session = await this.prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (session.user.isBanned) {
        throw new UnauthorizedException('Account is banned');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user.id);

      // Update session
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh tokens');
    }
  }

  async logout(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isBanned) {
      throw new UnauthorizedException('Invalid user');
    }

    return this.usersService.sanitizeUser(user);
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    return { accessToken, refreshToken };
  }
}
