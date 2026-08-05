import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      authorizationURL: 'https://discord.com/oauth2/authorize',
      tokenURL: 'https://discord.com/api/oauth2/token',
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: 'identify email',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return profile;
  }
}
