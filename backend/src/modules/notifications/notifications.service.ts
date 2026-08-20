import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { PushSubscriptionsService } from '../push-subscriptions/push-subscriptions.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    @Optional()
    private readonly pushSubscriptionsService: PushSubscriptionsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async findAll(
    workspaceId: string,
    userId: string,
    query: QueryNotificationDto,
  ) {
    const filters: any = { userId };
    if (query.isRead !== undefined) {
      filters.isRead = query.isRead;
    }
    return this.notificationsRepository.findAll(workspaceId, filters, query);
  }

  async findOne(workspaceId: string, id: string) {
    const notification = await this.notificationsRepository.findOne(
      workspaceId,
      id,
    );
    if (!notification)
      throw new NotFoundException(`Notification ${id} not found`);
    return notification;
  }

  async create(workspaceId: string, dto: CreateNotificationDto) {
    const notification = await this.notificationsRepository.create(
      workspaceId,
      dto,
    );

    if (this.pushSubscriptionsService) {
      this.pushSubscriptionsService
        .sendToUser(workspaceId, dto.userId, {
          title: dto.title,
          message: dto.message,
          link: dto.link,
        })
        .catch(() => {});
    }

    return notification;
  }

  async markAsRead(workspaceId: string, id: string) {
    const notification = await this.notificationsRepository.update(
      workspaceId,
      id,
      { isRead: true },
    );
    if (!notification)
      throw new NotFoundException(`Notification ${id} not found`);
    return notification;
  }

  async markAsUnread(workspaceId: string, id: string) {
    const notification = await this.notificationsRepository.update(
      workspaceId,
      id,
      { isRead: false },
    );
    if (!notification)
      throw new NotFoundException(`Notification ${id} not found`);
    return notification;
  }

  async markAllAsRead(workspaceId: string, userId: string) {
    return this.notificationsRepository.markAllAsRead(workspaceId, userId);
  }

  async getUnreadCount(workspaceId: string, userId: string) {
    return this.notificationsRepository.getUnreadCount(workspaceId, userId);
  }

  async remove(workspaceId: string, id: string) {
    const notification = await this.notificationsRepository.softDelete(
      workspaceId,
      id,
    );
    if (!notification)
      throw new NotFoundException(`Notification ${id} not found`);
    return notification;
  }

  async broadcastToAllUsers(
    dto: BroadcastNotificationDto,
  ): Promise<{ sent: number; total: number }> {
    const result = await this.usersService.findAll({ limit: 1000 });
    let sent = 0;

    for (const user of result.data) {
      try {
        await this.create(user.workspaceId, {
          userId: (user as any)._id.toString(),
          title: dto.title,
          message: dto.message,
          type: dto.type ?? 'info',
          link: dto.link,
        });
        await this.mailService.sendAnnouncementEmail(
          user.email,
          user.name,
          dto.title,
          dto.message,
          dto.link,
        );
        sent++;
      } catch {
        // seguir con el resto de los usuarios aunque uno falle
      }
    }

    return { sent, total: result.total };
  }
}
