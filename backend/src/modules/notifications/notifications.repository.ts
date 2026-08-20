import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Notification, NotificationDocument } from './notifications.schema';

@Injectable()
export class NotificationsRepository extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }

  async markAllAsRead(workspaceId: string, userId: string): Promise<void> {
    await this.model
      .updateMany(
        { workspaceId, userId, isRead: false, isDeleted: false },
        { $set: { isRead: true } },
      )
      .exec();
  }

  async getUnreadCount(workspaceId: string, userId: string): Promise<number> {
    return this.model
      .countDocuments({ workspaceId, userId, isRead: false, isDeleted: false })
      .exec();
  }
}
