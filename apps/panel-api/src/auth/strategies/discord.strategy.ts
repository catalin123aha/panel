import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    const clientID = process.env.DISCORD_CLIENT_ID || 'mock_client_id';
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || 'mock_client_secret';
    const callbackURL = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3002/login';

    super({
      authorizationURL: 'https://discord.com/oauth2/authorize',
      tokenURL: 'https://discord.com/api/oauth2/token',
      clientID,
      clientSecret,
      callbackURL,
      scope: 'identify email',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return profile;
  }
}
