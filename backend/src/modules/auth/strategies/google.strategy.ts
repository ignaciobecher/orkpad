import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error(
        'GoogleStrategy requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL env vars',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.send',
      ],
    });
  }

  authorizationParams(): Record<string, string> {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | undefined;
    accessToken: string;
    refreshToken: string;
  } {
    return {
      googleId: profile.id as string,
      email: profile.emails?.[0]?.value as string,
      name: (profile.displayName ||
        profile.name?.givenName ||
        'Google User') as string,
      avatarUrl: profile.photos?.[0]?.value as string | undefined,
      accessToken,
      refreshToken,
    };
  }
}
