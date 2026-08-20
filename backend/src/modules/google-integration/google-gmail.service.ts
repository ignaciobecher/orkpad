import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleIntegrationService } from './google-integration.service';

@Injectable()
export class GoogleGmailService {
  constructor(
    private readonly googleIntegrationService: GoogleIntegrationService,
  ) {}

  async sendEmail(
    userId: string,
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    const accessToken =
      await this.googleIntegrationService.getValidAccessToken(userId);

    const mimeMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      body,
    ].join('\r\n');

    const encoded = Buffer.from(mimeMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encoded }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new BadRequestException(`Failed to send email via Gmail: ${err}`);
    }
  }
}
