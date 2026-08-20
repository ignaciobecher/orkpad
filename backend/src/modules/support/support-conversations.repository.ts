import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseRepository,
  PaginatedResult,
} from '../../common/base/base.repository';
import {
  SupportConversation,
  SupportConversationDocument,
} from './support-conversations.schema';

@Injectable()
export class SupportConversationsRepository extends BaseRepository<SupportConversationDocument> {
  constructor(
    @InjectModel(SupportConversation.name)
    private readonly supportConversationModel: Model<SupportConversationDocument>,
  ) {
    super(supportConversationModel);
  }

  // ─── Cliente (tenant-scoped) ───────────────────────────────────────────────

  async findByUserId(
    workspaceId: string,
    userId: string,
  ): Promise<SupportConversationDocument | null> {
    return this.model.findOne({ workspaceId, userId, isDeleted: false }).exec();
  }

  async findOrCreateForUser(
    workspaceId: string,
    userId: string,
    userName: string | null,
    userEmail: string | null,
  ): Promise<SupportConversationDocument> {
    const existing = await this.findByUserId(workspaceId, userId);
    if (existing) return existing;

    return this.create(workspaceId, { userId, userName, userEmail });
  }

  async incrementUnreadAdmin(workspaceId: string, id: string): Promise<void> {
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $inc: { unreadCountAdmin: 1 } },
      )
      .exec();
  }

  async incrementUnreadCustomer(
    workspaceId: string,
    id: string,
  ): Promise<void> {
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $inc: { unreadCountCustomer: 1 } },
      )
      .exec();
  }

  async resetUnreadAdmin(workspaceId: string, id: string): Promise<void> {
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { unreadCountAdmin: 0 } },
      )
      .exec();
  }

  async resetUnreadCustomer(workspaceId: string, id: string): Promise<void> {
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { unreadCountCustomer: 0 } },
      )
      .exec();
  }

  async touchLastMessage(
    workspaceId: string,
    id: string,
    preview: string,
  ): Promise<void> {
    const trimmed =
      preview.length > 80 ? preview.substring(0, 80) + '...' : preview;
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { lastMessageAt: new Date(), lastMessagePreview: trimmed } },
      )
      .exec();
  }

  // ─── Admin (cross-tenant) ───────────────────────────────────────────────────

  async findAllForAdmin(
    filters: { search?: string },
    page: number,
    limit: number,
  ): Promise<PaginatedResult<SupportConversationDocument>> {
    const query: Record<string, any> = { isDeleted: false };
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ userName: regex }, { userEmail: regex }];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }

  async findByIdForAdmin(
    id: string,
  ): Promise<SupportConversationDocument | null> {
    return this.model.findOne({ _id: id, isDeleted: false }).exec();
  }

  async getTotalUnreadForAdmin(): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$unreadCountAdmin' } } },
    ]);
    return result[0]?.total ?? 0;
  }
}
