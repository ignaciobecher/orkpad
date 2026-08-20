import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class GoogleIntegrationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async isConnected(userId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    return !!(user as any)?.googleId;
  }

  async getConnectionStatus(
    userId: string,
  ): Promise<{ connected: boolean; email?: string }> {
    const user = await this.usersService.findById(userId);
    const connected = !!(user as any)?.googleId;
    return {
      connected,
      email: connected ? ((user as any).googleEmail ?? undefined) : undefined,
    };
  }

  async disconnect(userId: string): Promise<void> {
    await this.usersService.clearGoogleTokens(userId);
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const { accessToken, refreshToken } =
      await this.usersService.getGoogleTokens(userId);

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Google account not connected. Please connect your Google account first.',
      );
    }

    // Try the current access token first; if it fails, refresh it
    if (accessToken) {
      const valid = await this.verifyAccessToken(accessToken);
      if (valid) return accessToken;
    }

    return this.refreshAccessToken(userId, refreshToken);
  }

  private async verifyAccessToken(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  private async refreshAccessToken(
    userId: string,
    refreshToken: string,
  ): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId ?? '',
        client_secret: clientSecret ?? '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!res.ok) {
      throw new UnauthorizedException(
        'Failed to refresh Google access token. Please reconnect your Google account.',
      );
    }

    const data = (await res.json()) as GoogleTokenResponse;
    await this.usersService.updateGoogleTokens(userId, data.access_token);
    return data.access_token;
  }
}
