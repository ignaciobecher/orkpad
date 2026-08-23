import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private static readonly logger = new Logger(GithubStrategy.name);

  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      GithubStrategy.logger.warn(
        'GitHub OAuth is not configured — set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL to enable it.',
      );
    }

    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL: callbackURL || 'http://localhost:3000/auth/github/callback',
      scope: ['user:email', 'repo'],
    });
  }

  authorizationParams(options: any): object {
    const parentParams =
      typeof (Strategy.prototype as any).authorizationParams === 'function'
        ? (Strategy.prototype as any).authorizationParams.call(this, options)
        : {};
    return {
      ...parentParams,
      prompt: 'select_account',
    };
  }

  validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
  ): {
    githubId: string;
    name: string;
    email: string | undefined;
    avatarUrl: string | undefined;
    accessToken: string;
  } {
    return {
      githubId: profile.id as string,
      name: (profile.displayName ||
        profile.username ||
        'GitHub User') as string,
      email: profile.emails?.[0]?.value as string | undefined,
      avatarUrl: profile.photos?.[0]?.value as string | undefined,
      accessToken,
    };
  }
}
