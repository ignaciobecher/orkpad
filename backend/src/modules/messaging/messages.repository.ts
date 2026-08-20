import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseRepository,
  PaginatedResult,
} from '../../common/base/base.repository';
import { Message, MessageDocument } from './messages.schema';

@Injectable()
export class MessagesRepository extends BaseRepository<MessageDocument> {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }

  async findByConversation(
    workspaceId: string,
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<MessageDocument>> {
    return this.findAll(
      workspaceId,
      { conversationId },
      { page, limit, sort: { createdAt: -1 } },
    );
  }

  async markConversationRead(
    workspaceId: string,
    conversationId: string,
  ): Promise<void> {
    await this.model
      .updateMany(
        { workspaceId, conversationId, isRead: false, isDeleted: false },
        { $set: { isRead: true, readAt: new Date() } },
      )
      .exec();
  }
}
