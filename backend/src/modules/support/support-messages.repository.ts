import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseRepository,
  PaginatedResult,
} from '../../common/base/base.repository';
import {
  SupportMessage,
  SupportMessageDocument,
} from './support-messages.schema';

@Injectable()
export class SupportMessagesRepository extends BaseRepository<SupportMessageDocument> {
  constructor(
    @InjectModel(SupportMessage.name)
    private readonly supportMessageModel: Model<SupportMessageDocument>,
  ) {
    super(supportMessageModel);
  }

  // ─── Cliente (tenant-scoped) ───────────────────────────────────────────────

  async findByConversation(
    workspaceId: string,
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<SupportMessageDocument>> {
    return this.findAll(
      workspaceId,
      { conversationId },
      { page, limit, sort: { createdAt: -1 } },
    );
  }

  async markConversationRead(
    workspaceId: string,
    conversationId: string,
    senderType: 'admin' | 'customer',
  ): Promise<void> {
    await this.model
      .updateMany(
        {
          workspaceId,
          conversationId,
          isRead: false,
          isDeleted: false,
          senderType,
        },
        { $set: { isRead: true, readAt: new Date() } },
      )
      .exec();
  }

  // ─── Admin (cross-tenant) ───────────────────────────────────────────────────

  async findByConversationForAdmin(
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<SupportMessageDocument>> {
    const query = { conversationId, isDeleted: false };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query),
    ]);
    return { data, total, page, limit };
  }

  async markConversationReadForAdmin(conversationId: string): Promise<void> {
    await this.model
      .updateMany(
        {
          conversationId,
          isRead: false,
          isDeleted: false,
          senderType: 'customer',
        },
        { $set: { isRead: true, readAt: new Date() } },
      )
      .exec();
  }
}
