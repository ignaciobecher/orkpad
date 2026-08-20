import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Conversation, ConversationDocument } from './conversations.schema';

@Injectable()
export class ConversationsRepository extends BaseRepository<ConversationDocument> {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {
    super(conversationModel);
  }

  async findByProjectId(
    workspaceId: string,
    projectId: string,
  ): Promise<ConversationDocument | null> {
    return this.model
      .findOne({ workspaceId, projectId, isDeleted: false })
      .exec();
  }

  async findByClientId(
    workspaceId: string,
    clientId: string,
  ): Promise<ConversationDocument | null> {
    return this.model
      .findOne({ workspaceId, clientId, isDeleted: false })
      .exec();
  }

  async incrementUnread(workspaceId: string, id: string): Promise<void> {
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $inc: { unreadCount: 1 }, $set: { lastMessageAt: new Date() } },
      )
      .exec();
  }

  async resetUnread(workspaceId: string, id: string): Promise<void> {
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { unreadCount: 0 } },
      )
      .exec();
  }

  async touchLastMessage(workspaceId: string, id: string): Promise<void> {
    await this.model
      .updateOne(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { lastMessageAt: new Date() } },
      )
      .exec();
  }
}
