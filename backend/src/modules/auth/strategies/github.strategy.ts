import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
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
