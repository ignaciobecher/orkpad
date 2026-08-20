import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushSubscriptionsRepository } from './push-subscriptions.repository';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { PushSubscriptionDocument } from './push-subscriptions.schema';

export interface PushPayload {
  title: string;
  message: string;
  link?: string;
}

@Injectable()
export class PushSubscriptionsService {
  private readonly logger = new Logger(PushSubscriptionsService.name);
  private readonly vapidConfigured: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly pushSubscriptionsRepository: PushSubscriptionsRepository,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>(
      'VAPID_SUBJECT',
      'mailto:admin@orkpad.com',
    );

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.vapidConfigured = true;
    } else {
      this.logger.warn(
        'VAPID keys not configured — push notifications disabled',
      );
      this.vapidConfigured = false;
    }
  }

  getVapidPublicKey(): string | null {
    return this.configService.get<string>('VAPID_PUBLIC_KEY') ?? null;
  }

  async subscribe(
    workspaceId: string,
    userId: string,
    dto: CreatePushSubscriptionDto,
  ): Promise<PushSubscriptionDocument> {
    return this.pushSubscriptionsRepository.upsertByEndpoint(
      workspaceId,
      userId,
      dto,
    );
  }

  async unsubscribe(
    workspaceId: string,
    userId: string,
    endpoint: string,
  ): Promise<void> {
    await this.pushSubscriptionsRepository.deleteByEndpoint(
      workspaceId,
      userId,
      endpoint,
    );
  }

  async sendToUser(
    workspaceId: string,
    userId: string,
    payload: PushPayload,
  ): Promise<void> {
    if (!this.vapidConfigured) return;

    const subscriptions = await this.pushSubscriptionsRepository.findAllByUser(
      workspaceId,
      userId,
    );
    if (subscriptions.length === 0) return;

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { auth: sub.auth, p256dh: sub.p256dh },
            },
            JSON.stringify(payload),
          );
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await this.pushSubscriptionsRepository
              .deleteExpiredEndpoint(workspaceId, sub.endpoint)
              .catch(() => {});
          } else {
            this.logger.warn(
              `Push send failed for user ${userId}: ${err.message}`,
            );
          }
        }
      }),
    );
  }

  async sendToUsers(
    workspaceId: string,
    userIds: string[],
    payload: PushPayload,
  ): Promise<void> {
    await Promise.allSettled(
      userIds.map((uid) => this.sendToUser(workspaceId, uid, payload)),
    );
  }
}
