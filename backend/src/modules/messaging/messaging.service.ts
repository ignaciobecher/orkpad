import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConversationsRepository } from './conversations.repository';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';

@Injectable()
export class MessagingService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly messagesRepository: MessagesRepository,
  ) {}

  // ─── Admin Methods ─────────────────────────────────────────────────────────

  findAllConversations(workspaceId: string, query: QueryConversationsDto) {
    const filters: Record<string, any> = {};
    if (query.clientId) filters.clientId = query.clientId;
    return this.conversationsRepository.findAll(workspaceId, filters, {
      page: query.page,
      limit: query.limit,
      sort: { lastMessageAt: -1 },
    });
  }

  async findConversation(workspaceId: string, id: string) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      id,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${id} not found`);
    return conversation;
  }

  async createConversation(workspaceId: string, dto: CreateConversationDto) {
    if (dto.projectId) {
      const existing = await this.conversationsRepository.findByProjectId(
        workspaceId,
        dto.projectId,
      );
      if (existing) return existing;
    }
    return this.conversationsRepository.create(workspaceId, dto);
  }

  async findMessages(
    workspaceId: string,
    conversationId: string,
    query: QueryMessagesDto,
  ) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      conversationId,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    return this.messagesRepository.findByConversation(
      workspaceId,
      conversationId,
      query.page ?? 1,
      query.limit ?? 30,
    );
  }

  async sendAdminMessage(
    workspaceId: string,
    conversationId: string,
    senderId: string,
    dto: CreateMessageDto,
  ) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      conversationId,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${conversationId} not found`);

    const message = await this.messagesRepository.create(workspaceId, {
      conversationId,
      senderType: 'admin',
      senderId,
      content: dto.content,
      isRead: true,
      readAt: new Date(),
    });

    await this.conversationsRepository.touchLastMessage(
      workspaceId,
      conversationId,
    );

    return message;
  }

  async markConversationRead(workspaceId: string, conversationId: string) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      conversationId,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${conversationId} not found`);

    await Promise.all([
      this.messagesRepository.markConversationRead(workspaceId, conversationId),
      this.conversationsRepository.resetUnread(workspaceId, conversationId),
    ]);

    return { success: true };
  }
}
